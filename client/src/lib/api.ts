// API abstraction: tries the Express server first, falls back to localStorage.
// This allows the app to work both locally (with server) and on Vercel (static).

const LS_KEY = 'climate-reality-sessions';

function getSessions(): any[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSessions(sessions: any[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
}

async function tryServer<T>(url: string, options?: RequestInit): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function fetchSessions(): Promise<any[]> {
  const server = await tryServer<any[]>('/api/sessions');
  if (server.ok) return server.data;
  return getSessions().sort((a: any, b: any) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export async function fetchSession(id: string): Promise<any | null> {
  const server = await tryServer<any>(`/api/sessions/${id}`);
  if (server.ok) return server.data;
  return getSessions().find((s: any) => s.id === id) || null;
}

export async function createSession(form: {
  participantName: string;
  participantRole: string;
  organization: string;
  context: string;
}): Promise<any> {
  const server = await tryServer<any>('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (server.ok) return server.data;

  // Fallback: create locally
  const session = {
    id: `session-${Date.now()}`,
    participantName: form.participantName,
    participantRole: form.participantRole,
    organization: form.organization,
    context: form.context,
    startTime: new Date().toISOString(),
    endTime: null,
    openingNotes: '',
    conceptReactions: {},
    ideaCards: [],
    closingNotes: '',
  };
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  return session;
}

export async function updateSession(id: string, data: any): Promise<any> {
  const server = await tryServer<any>(`/api/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (server.ok) return server.data;

  // Fallback: update locally
  const sessions = getSessions();
  const idx = sessions.findIndex((s: any) => s.id === id);
  if (idx >= 0) {
    sessions[idx] = { ...data, id };
    saveSessions(sessions);
    return sessions[idx];
  }
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  const server = await tryServer<any>(`/api/sessions/${id}`, { method: 'DELETE' });
  if (server.ok) return;

  const sessions = getSessions().filter((s: any) => s.id !== id);
  saveSessions(sessions);
}

export async function fetchConceptMedia(): Promise<Record<string, any>> {
  const server = await tryServer<any>('/api/concept-media');
  if (server.ok) return server.data;

  const { conceptMedia } = await import('../data/conceptMedia');
  return conceptMedia;
}

export async function fetchSynthesis(): Promise<any> {
  const server = await tryServer<any>('/api/synthesis');
  if (server.ok) return server.data;

  // Fallback: compute from localStorage
  const sessions = getSessions();
  const completed = sessions.filter((s: any) => s.endTime);

  const conceptAgg: Record<string, { ratings: number[]; wouldWatch: number; total: number; notes: string[] }> = {};
  for (const s of completed) {
    for (const [conceptId, reaction] of Object.entries(s.conceptReactions || {}) as [string, any][]) {
      if (!conceptAgg[conceptId]) conceptAgg[conceptId] = { ratings: [], wouldWatch: 0, total: 0, notes: [] };
      conceptAgg[conceptId].total++;
      if (reaction.rating > 0) conceptAgg[conceptId].ratings.push(reaction.rating);
      if (reaction.wouldWatch) conceptAgg[conceptId].wouldWatch++;
      if (reaction.notes?.trim()) conceptAgg[conceptId].notes.push(reaction.notes.trim());
    }
  }

  const conceptSummaries = Object.entries(conceptAgg).map(([conceptId, data]) => ({
    conceptId,
    avgRating: data.ratings.length > 0
      ? Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 10) / 10
      : 0,
    wouldWatchPct: data.total > 0 ? Math.round((data.wouldWatch / data.total) * 100) : 0,
    totalReviewed: data.total,
    allNotes: data.notes,
  }));

  const allIdeas: any[] = [];
  for (const s of completed) {
    for (const idea of (s.ideaCards || [])) {
      allIdeas.push({ ...idea, sessionId: s.id, participantName: s.participantName, participantRole: s.participantRole, organization: s.organization });
    }
  }

  const allNotes = completed.map((s: any) => ({
    sessionId: s.id, participantName: s.participantName, participantRole: s.participantRole,
    organization: s.organization, date: s.startTime, openingNotes: s.openingNotes || '', closingNotes: s.closingNotes || '',
  }));

  return { totalSessions: sessions.length, completedSessions: completed.length, conceptSummaries, allIdeas, allNotes };
}
