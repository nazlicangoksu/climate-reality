import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const KEY = 'one-last-thing:submissions';
const MAX_LEN = 280;
const MAX_RETURN = 200;

type Submission = { text: string; ts: number };

function sanitize(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_LEN) return null;
  // strip HTML tags as a basic safety measure
  return trimmed.replace(/<[^>]*>/g, '').slice(0, MAX_LEN);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const raw = await redis.lrange(KEY, 0, MAX_RETURN - 1);
      const submissions: Submission[] = (raw || [])
        .map((entry: unknown) => {
          if (typeof entry === 'string') {
            try { return JSON.parse(entry) as Submission; } catch { return null; }
          }
          if (entry && typeof entry === 'object') return entry as Submission;
          return null;
        })
        .filter((s): s is Submission => !!s && typeof s.text === 'string');
      return res.json({ submissions });
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) || {};
      const text = sanitize(body.text);
      if (!text) return res.status(400).json({ error: 'text required (<= 280 chars)' });
      const submission: Submission = { text, ts: Date.now() };
      await redis.lpush(KEY, JSON.stringify(submission));
      // Cap the list at 1000 newest
      await redis.ltrim(KEY, 0, 999);
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'server error' });
  }
}
