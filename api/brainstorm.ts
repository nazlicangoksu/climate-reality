import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { collectIdeas, clusterIdeas } from './_cluster-utils';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const GRID_KEY = 'brainstorm:grid';
const HEARTS_KEY = 'brainstorm:hearts';     // hash: cellId -> JSON array of user names
const PRESENCE_KEY = 'brainstorm:presence'; // hash: odisabeuserI -> JSON { cellId, name, ts }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query.action as string | undefined;

    // GET: return grid + hearts + presence in one call
    if (req.method === 'GET' && action !== 'archives') {
      const [grid, hearts, presence] = await Promise.all([
        redis.hgetall(GRID_KEY),
        redis.hgetall(HEARTS_KEY),
        redis.hgetall(PRESENCE_KEY),
      ]);

      // Parse hearts: each value is a JSON array of names
      const parsedHearts: Record<string, string[]> = {};
      if (hearts) {
        for (const [cellId, val] of Object.entries(hearts)) {
          try {
            parsedHearts[cellId] = typeof val === 'string' ? JSON.parse(val) : val as string[];
          } catch {
            parsedHearts[cellId] = [];
          }
        }
      }

      // Parse presence and filter stale entries (older than 10s)
      const now = Date.now();
      const activeUsers: Record<string, string[]> = {}; // cellId -> [names]
      if (presence) {
        for (const [userId, val] of Object.entries(presence)) {
          try {
            const p = typeof val === 'string' ? JSON.parse(val) : val as { cellId: string; name: string; ts: number };
            if (now - p.ts < 10000 && p.cellId) {
              if (!activeUsers[p.cellId]) activeUsers[p.cellId] = [];
              activeUsers[p.cellId].push(p.name);
            } else {
              // Clean up stale presence
              redis.hdel(PRESENCE_KEY, userId);
            }
          } catch {
            redis.hdel(PRESENCE_KEY, userId);
          }
        }
      }

      return res.json({
        grid: grid || {},
        hearts: parsedHearts,
        presence: activeUsers,
      });
    }

    // PUT: update cell text
    if (req.method === 'PUT' && action === 'cell') {
      const { id, text } = req.body;
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'id is required' });
      }
      await redis.hset(GRID_KEY, { [id]: text || '' });
      return res.json({ ok: true });
    }

    // POST: toggle heart on a cell
    if (req.method === 'POST' && action === 'heart') {
      const { cellId, userName } = req.body;
      if (!cellId || !userName) {
        return res.status(400).json({ error: 'cellId and userName required' });
      }
      const raw = await redis.hget(HEARTS_KEY, cellId);
      let names: string[] = [];
      try {
        names = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw as string[]) : [];
      } catch { names = []; }

      const idx = names.indexOf(userName);
      if (idx >= 0) {
        names.splice(idx, 1); // un-heart
      } else {
        names.push(userName); // heart
      }
      await redis.hset(HEARTS_KEY, { [cellId]: JSON.stringify(names) });
      return res.json({ hearts: names });
    }

    // POST: update presence (who's typing where)
    if (req.method === 'POST' && action === 'presence') {
      const { userId, cellId, name } = req.body;
      if (!userId || !name) {
        return res.status(400).json({ error: 'userId and name required' });
      }
      if (cellId) {
        await redis.hset(PRESENCE_KEY, {
          [userId]: JSON.stringify({ cellId, name, ts: Date.now() }),
        });
      } else {
        await redis.hdel(PRESENCE_KEY, userId);
      }
      return res.json({ ok: true });
    }

    // POST: archive current board then clear
    if (req.method === 'POST' && action === 'archive') {
      const { label } = req.body;
      const [grid, hearts] = await Promise.all([
        redis.hgetall(GRID_KEY),
        redis.hgetall(HEARTS_KEY),
      ]);

      // Parse hearts
      const parsedHearts: Record<string, string[]> = {};
      if (hearts) {
        for (const [cellId, val] of Object.entries(hearts)) {
          try {
            parsedHearts[cellId] = typeof val === 'string' ? JSON.parse(val) : val as string[];
          } catch { parsedHearts[cellId] = []; }
        }
      }

      // Auto-cluster both HMW rounds
      const gridData = (grid || {}) as Record<string, string>;
      let allClusters: Record<string, any[]> = {};
      try {
        const [clusters0, clusters1] = await Promise.all([
          collectIdeas(gridData, parsedHearts, 0).length >= 2
            ? clusterIdeas(collectIdeas(gridData, parsedHearts, 0), 0)
            : Promise.resolve([]),
          collectIdeas(gridData, parsedHearts, 1).length >= 2
            ? clusterIdeas(collectIdeas(gridData, parsedHearts, 1), 1)
            : Promise.resolve([]),
        ]);
        allClusters = { hmw0: clusters0, hmw1: clusters1 };
      } catch (err) {
        console.error('Auto-clustering failed, archiving without clusters:', err);
      }

      const archive = {
        label: label || new Date().toLocaleString(),
        timestamp: new Date().toISOString(),
        grid: gridData,
        hearts: parsedHearts,
        clusters: allClusters,
      };

      const archiveId = `archive:${Date.now()}`;
      await redis.hset('brainstorm:archives', { [archiveId]: JSON.stringify(archive) });

      // Clear active board
      await Promise.all([
        redis.del(GRID_KEY),
        redis.del(HEARTS_KEY),
        redis.del(PRESENCE_KEY),
      ]);
      return res.json({ ok: true, archiveId });
    }

    // GET archives list
    if (req.method === 'GET' && action === 'archives') {
      const raw = await redis.hgetall('brainstorm:archives');
      const archives: { id: string; label: string; timestamp: string; ideaCount: number }[] = [];
      if (raw) {
        for (const [id, val] of Object.entries(raw)) {
          try {
            const a = typeof val === 'string' ? JSON.parse(val) : val as any;
            const ideaCount = Object.values(a.grid || {}).filter((v: any) => v && String(v).trim()).length;
            archives.push({ id, label: a.label, timestamp: a.timestamp, ideaCount });
          } catch {}
        }
      }
      archives.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return res.json(archives);
    }

    // POST: restore an archive to active board
    if (req.method === 'POST' && action === 'restore') {
      const { archiveId } = req.body;
      if (!archiveId) return res.status(400).json({ error: 'archiveId required' });
      const raw = await redis.hget('brainstorm:archives', archiveId);
      if (!raw) return res.status(404).json({ error: 'Archive not found' });
      const archive = typeof raw === 'string' ? JSON.parse(raw) : raw as any;

      // Clear current board
      await Promise.all([
        redis.del(GRID_KEY),
        redis.del(HEARTS_KEY),
        redis.del(PRESENCE_KEY),
      ]);

      // Restore grid
      if (archive.grid && Object.keys(archive.grid).length > 0) {
        await redis.hset(GRID_KEY, archive.grid);
      }
      // Restore hearts
      if (archive.hearts) {
        const heartsToSet: Record<string, string> = {};
        for (const [cellId, names] of Object.entries(archive.hearts)) {
          heartsToSet[cellId] = JSON.stringify(names);
        }
        if (Object.keys(heartsToSet).length > 0) {
          await redis.hset(HEARTS_KEY, heartsToSet);
        }
      }
      return res.json({ ok: true });
    }

    // DELETE: permanently delete an archive
    if (req.method === 'DELETE' && action === 'delete-archive') {
      const archiveId = req.query.id as string;
      if (!archiveId) return res.status(400).json({ error: 'id required' });
      await redis.hdel('brainstorm:archives', archiveId);
      return res.json({ ok: true });
    }

    // GET: fetch full archive data for export
    if (req.method === 'GET' && action === 'archive-data') {
      const archiveId = req.query.id as string;
      if (!archiveId) return res.status(400).json({ error: 'id required' });
      const raw = await redis.hget('brainstorm:archives', archiveId);
      if (!raw) return res.status(404).json({ error: 'Archive not found' });
      const archive = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return res.json(archive);
    }

    // Fallback PUT without action (backwards compat)
    if (req.method === 'PUT') {
      const { id, text } = req.body;
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'id is required' });
      }
      await redis.hset(GRID_KEY, { [id]: text || '' });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Brainstorm API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
