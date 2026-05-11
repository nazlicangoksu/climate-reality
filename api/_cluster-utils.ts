import Anthropic from '@anthropic-ai/sdk';

const HMW_QUESTIONS = [
  'How might we design a show that turns climate skeptics into climate advocates, without saying a word about climate?',
  'How might we design a reality TV show that creates new climate heroes?',
];

export type ClusterIdea = { id: string; text: string; hearts: number };
export type Cluster = { theme: string; description: string; ideas: ClusterIdea[] };

export function collectIdeas(
  grid: Record<string, string>,
  hearts: Record<string, string[]>,
  hmwIndex: number
): ClusterIdea[] {
  const prefix = `hmw${hmwIndex}-`;
  const ideas: ClusterIdea[] = [];
  for (const [cellId, text] of Object.entries(grid)) {
    if (!cellId.startsWith(prefix)) continue;
    const t = String(text).trim();
    if (!t) continue;
    const cellHearts = hearts[cellId] || [];
    ideas.push({ id: cellId, text: t, hearts: cellHearts.length });
  }
  return ideas;
}

export async function clusterIdeas(ideas: ClusterIdea[], hmwIndex: number): Promise<Cluster[]> {
  if (ideas.length < 2) return [];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const ideasList = ideas.map((idea, i) => `${i + 1}. "${idea.text}" [${idea.hearts} hearts]`).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a design strategist helping cluster brainstorm ideas from a Stanford GSB class on climate and reality TV.

The "How Might We" question was:
"${HMW_QUESTIONS[hmwIndex]}"

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

  return parsed.clusters.map((cluster: any) => ({
    theme: cluster.theme,
    description: cluster.description,
    ideas: cluster.ideaNumbers
      .map((n: number) => ideas[n - 1])
      .filter(Boolean),
  }));
}
