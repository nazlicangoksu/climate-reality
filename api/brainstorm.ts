import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTES_KEY = 'brainstorm:notes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const notes = await kv.hgetall(NOTES_KEY);
      const list = notes ? Object.values(notes) : [];
      return res.json(list);
    }

    if (req.method === 'POST') {
      const note = req.body;
      await kv.hset(NOTES_KEY, { [note.id]: note });
      return res.json({ ok: true });
    }

    if (req.method === 'PUT') {
      const note = req.body;
      await kv.hset(NOTES_KEY, { [note.id]: note });
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (id) {
        await kv.hdel(NOTES_KEY, id);
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Brainstorm API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
