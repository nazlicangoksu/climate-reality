import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const GRID_KEY = 'brainstorm:grid';
const HEARTS_KEY = 'brainstorm:hearts';

const HMW_QUESTIONS = [
  'How might we design a show that turns climate skeptics into climate advocates, without saying a word about climate?',
  'How might we design a reality TV show that creates new climate heroes?',
];

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

    // Collect ideas for the requested HMW round
    const prefix = `hmw${idx}-`;
    const ideas: { id: string; text: string; hearts: number }[] = [];

    if (grid) {
      for (const [cellId, text] of Object.entries(grid)) {
        if (!cellId.startsWith(prefix)) continue;
        const t = String(text).trim();
        if (!t) continue;
        let heartCount = 0;
        if (hearts && hearts[cellId]) {
          try {
            const h = typeof hearts[cellId] === 'string' ? JSON.parse(hearts[cellId] as string) : hearts[cellId];
            heartCount = Array.isArray(h) ? h.length : 0;
          } catch {}
        }
        ideas.push({ id: cellId, text: t, hearts: heartCount });
      }
    }

    if (ideas.length < 2) {
      return res.json({ clusters: [], message: 'Need at least 2 ideas to cluster.' });
    }

    const ideasList = ideas.map((idea, i) => `${i + 1}. "${idea.text}" [${idea.hearts} hearts]`).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a design strategist helping cluster brainstorm ideas from a Stanford GSB class on climate and reality TV.

The "How Might We" question was:
"${HMW_QUESTIONS[idx]}"

Here are the brainstorm ideas:

${ideasList}

Your job is to find the UNDERLYING STRATEGIC INSIGHT that connects ideas, not just describe what the ideas literally say.

Bad cluster name: "Reality TV Infiltration" (just restates the ideas)
Good cluster name: "Make climate the setting, not the subject" (captures the deeper strategy)

Bad cluster name: "Community engagement approaches" (generic, vague)
Good cluster name: "Profit from sustainability without the sustainability pitch" (sharp, provocative, actionable)

Rules:
- Theme names should sound like a strategic principle or a provocative insight, not a category label
- The description should explain WHY this cluster matters or what makes it a distinct strategic angle
- Group into 3-6 clusters based on the underlying mechanism or strategy, not surface-level topic similarity
- An idea can only belong to one cluster

Respond ONLY with valid JSON in this exact format, no other text:
{
  "clusters": [
    {
      "theme": "Theme Name Here",
      "description": "Why this strategic angle matters - one sharp sentence.",
      "ideaNumbers": [1, 3, 5]
    }
  ]
}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    // Map idea numbers back to actual ideas
    const clusters = parsed.clusters.map((cluster: any) => ({
      theme: cluster.theme,
      description: cluster.description,
      ideas: cluster.ideaNumbers
        .map((n: number) => ideas[n - 1])
        .filter(Boolean),
    }));

    return res.json({ clusters });
  } catch (err) {
    console.error('Cluster API error:', err);
    return res.status(500).json({ error: 'Failed to cluster ideas' });
  }
}
