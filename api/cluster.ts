import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { collectIdeas, clusterIdeas } from './_cluster-utils';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const GRID_KEY = 'brainstorm:grid';
const HEARTS_KEY = 'brainstorm:hearts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { hmwIndex } = req.body;
    const idx = typeof hmwIndex === 'number' ? hmwIndex : 0;

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

    const ideas = collectIdeas(grid as Record<string, string> || {}, parsedHearts, idx);
    if (ideas.length < 2) {
      return res.json({ clusters: [], message: 'Need at least 2 ideas to cluster.' });
    }

    const clusters = await clusterIdeas(ideas, idx);
    return res.json({ clusters });
  } catch (err) {
    console.error('Cluster API error:', err);
    return res.status(500).json({ error: 'Failed to cluster ideas' });
  }
}
