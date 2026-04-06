import { useState, useRef, useEffect, useCallback } from 'react';
import { showConcepts } from '../data/showConcepts';
import { conceptMedia as staticMedia } from '../data/conceptMedia';

const COLORS = [
  'bg-amber-300', 'bg-yellow-200', 'bg-orange-200', 'bg-lime-200',
  'bg-emerald-200', 'bg-sky-200', 'bg-violet-200', 'bg-pink-200',
];

const DUMP_ROWS = 6;
const DUMP_COLS = 6;
const FEEDBACK_ROWS = 4;
const FEEDBACK_COLS = 4;

function buildCellIds(prefix: string, rows: number, cols: number): string[] {
  const ids: string[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      ids.push(`${prefix}-r${r}-c${c}`);
  return ids;
}

const WORKSHEET_FIELDS = [
  { id: 'title', label: 'Show title', placeholder: 'What is it called?', rows: 1 },
  { id: 'logline', label: 'One-line pitch', placeholder: 'One sentence. Why does someone who has never thought about climate watch this?', rows: 2 },
  { id: 'format', label: 'Format it borrows from', placeholder: 'Every great show is a familiar format with one thing changed. What is yours?', rows: 2 },
  { id: 'hook', label: 'The hook', placeholder: 'What is the human drive? Competition? Love? Money? Survival? Status?', rows: 2 },
  { id: 'cast', label: 'Who is in it?', placeholder: 'Describe 2-3 characters. Who do you root for? Who is the villain?', rows: 3 },
  { id: 'climate', label: 'How does behavior change happen?', placeholder: 'How does the show change what people think or do without saying "climate"?', rows: 3 },
  { id: 'wild', label: 'The wild card', placeholder: 'What is the one thing about this show nobody has ever seen before?', rows: 2 },
];

function getUserId(): string {
  let id = sessionStorage.getItem('brainstorm-uid');
  if (!id) { id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('brainstorm-uid', id); }
  return id;
}

// ── API ──

type ServerData = { grid: Record<string, string>; hearts: Record<string, string[]>; presence: Record<string, string[]> };
type Cluster = { theme: string; description: string; ideas: { id: string; text: string; hearts: number }[] };

async function apiFetch(): Promise<ServerData | null> {
  try { const r = await fetch('/api/brainstorm'); return r.ok ? r.json() : null; } catch { return null; }
}
async function apiUpdateCell(id: string, text: string) {
  try { await fetch('/api/brainstorm?action=cell', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, text }) }); } catch {}
}
async function apiToggleHeart(cellId: string, userName: string) {
  try { await fetch('/api/brainstorm?action=heart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cellId, userName }) }); } catch {}
}
async function apiUpdatePresence(userId: string, name: string, cellId: string | null) {
  try { await fetch('/api/brainstorm?action=presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name, cellId }) }); } catch {}
}
async function apiArchiveAndClear(label: string) {
  try { await fetch('/api/brainstorm?action=archive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label }) }); } catch {}
}
async function apiFetchArchives() {
  try { const r = await fetch('/api/brainstorm?action=archives'); return r.ok ? r.json() : []; } catch { return []; }
}
async function apiRestoreArchive(archiveId: string) {
  try { await fetch('/api/brainstorm?action=restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archiveId }) }); } catch {}
}
async function apiDeleteArchive(archiveId: string) {
  try { await fetch(`/api/brainstorm?action=delete-archive&id=${encodeURIComponent(archiveId)}`, { method: 'DELETE' }); } catch {}
}
async function apiGetArchiveData(archiveId: string) {
  try { const r = await fetch(`/api/brainstorm?action=archive-data&id=${encodeURIComponent(archiveId)}`); return r.ok ? r.json() : null; } catch { return null; }
}

// ── Steps ──
const STEPS = [
  { id: 'dump', label: 'Brain Dump' },
  ...showConcepts.flatMap(c => [
    { id: `show-${c.id}`, label: c.title },
    { id: `feedback-${c.id}`, label: `C/C: ${c.title}` },
  ]),
  { id: 'worksheet', label: 'Design Your Show' },
];

export default function Brainstorm() {
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [hearts, setHearts] = useState<Record<string, string[]>>({});
  const [presence, setPresence] = useState<Record<string, string[]>>({});
  const [userName, setUserName] = useState(() => sessionStorage.getItem('brainstorm-name') || '');
  const [nameSet, setNameSet] = useState(() => !!sessionStorage.getItem('brainstorm-name'));
  const [showArchivePanel, setShowArchivePanel] = useState(false);
  const [archiveLabel, setArchiveLabel] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archives, setArchives] = useState<{ id: string; label: string; timestamp: string; ideaCount: number }[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingArchiveClusters, setViewingArchiveClusters] = useState<{ label: string; clusters: Record<string, Cluster[]> } | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('brainstorm-admin') === 'true');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const editingId = useRef<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const prevFilledRef = useRef<Set<string>>(new Set());
  const [newCells, setNewCells] = useState<Set<string>>(new Set());
  const userId = useRef(getUserId());

  const currentStep = STEPS[step];

  // Load on mount
  useEffect(() => {
    apiFetch().then(data => { if (data) { setGrid(data.grid); setHearts(data.hearts); setPresence(data.presence); } });
  }, []);

  // Poll every 2s
  useEffect(() => {
    if (!nameSet) return;
    let active = true;
    const poll = async () => {
      const data = await apiFetch();
      if (data && active) {
        setGrid(prev => {
          const merged = { ...prev, ...data.grid };
          if (editingId.current && prev[editingId.current] !== undefined) merged[editingId.current] = prev[editingId.current];
          const nowFilled = new Set(Object.entries(merged).filter(([, v]) => v?.trim()).map(([k]) => k));
          const appearing = new Set<string>();
          nowFilled.forEach(k => { if (!prevFilledRef.current.has(k)) appearing.add(k); });
          prevFilledRef.current = nowFilled;
          if (appearing.size > 0) { setNewCells(appearing); setTimeout(() => setNewCells(new Set()), 1500); }
          return merged;
        });
        setHearts(data.hearts);
        setPresence(data.presence);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [nameSet]);

  // Presence
  useEffect(() => {
    if (!nameSet) return;
    const interval = setInterval(() => apiUpdatePresence(userId.current, userName, editingId.current), 3000);
    return () => clearInterval(interval);
  }, [nameSet, userName]);
  useEffect(() => () => { if (nameSet) apiUpdatePresence(userId.current, userName, null); }, [nameSet, userName]);

  const updateCell = useCallback((id: string, text: string) => {
    editingId.current = id;
    setGrid(prev => ({ ...prev, [id]: text }));
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => {
      apiUpdateCell(id, text).then(() => { if (editingId.current === id) editingId.current = null; });
    }, 500);
  }, []);

  const toggleHeart = useCallback((cellId: string) => {
    if (!nameSet) return;
    setHearts(prev => {
      const cur = prev[cellId] || [];
      return { ...prev, [cellId]: cur.includes(userName) ? cur.filter(n => n !== userName) : [...cur, userName] };
    });
    apiToggleHeart(cellId, userName);
  }, [userName, nameSet]);

  const handleArchiveAndClear = async () => {
    for (const t of Object.values(saveTimers.current)) clearTimeout(t);
    saveTimers.current = {};
    editingId.current = null;
    prevFilledRef.current = new Set();
    await apiArchiveAndClear(archiveLabel.trim() || new Date().toLocaleString());
    setGrid({}); setHearts({}); setPresence({}); setNewCells(new Set());
    setArchiveLabel(''); setShowArchiveConfirm(false);
    setArchives(await apiFetchArchives());
  };

  const exportJSON = () => {
    const exportData = { grid, hearts, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'brainstorm-export.json'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Grid renderer ──
  const renderGrid = (cellIds: string[], cols: number) => (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: '120px' }}>
      {cellIds.map((id, i) => {
        const text = grid[id] || '';
        const cellHearts = hearts[id] || [];
        const hearted = cellHearts.includes(userName);
        const cellPresence = (presence[id] || []).filter(n => n !== userName);
        const isNew = newCells.has(id);
        const hasText = text.trim().length > 0;
        return (
          <div key={id} className={`${COLORS[i % COLORS.length]} rounded-lg shadow-md flex flex-col overflow-hidden relative transition-all duration-300 ${isNew ? 'ring-2 ring-amber-400 scale-[1.02]' : ''}`}>
            {cellPresence.length > 0 && (
              <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                {cellPresence.map(n => <span key={n} className="bg-black/20 text-black/60 text-[8px] font-ui px-1.5 py-0.5 rounded-full">{n}</span>)}
              </div>
            )}
            <textarea value={text} onChange={(e) => updateCell(id, e.target.value)}
              onFocus={() => { editingId.current = id; apiUpdatePresence(userId.current, userName, id); }}
              onBlur={() => { if (editingId.current === id) editingId.current = null; apiUpdatePresence(userId.current, userName, null); }}
              placeholder="Type here..." className="flex-1 w-full bg-transparent text-black/80 text-sm font-body resize-none px-3 pt-2.5 pb-1 outline-none placeholder:text-black/20 leading-relaxed" />
            {hasText && (
              <div className="flex items-center justify-between px-3 pb-2">
                <button onClick={() => toggleHeart(id)} className={`flex items-center gap-1 text-xs transition-all ${hearted ? 'text-red-500 scale-110' : 'text-black/25 hover:text-red-400'}`}>
                  <span>{hearted ? '❤️' : '♡'}</span>
                  {cellHearts.length > 0 && <span className="text-[10px] font-ui">{cellHearts.length}</span>}
                </button>
                {cellHearts.length > 0 && <span className="text-[8px] text-black/30 font-ui truncate max-w-[80px]">{cellHearts.join(', ')}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Name entry ──
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <form onSubmit={(e) => { e.preventDefault(); if (userName.trim()) { setUserName(userName.trim()); sessionStorage.setItem('brainstorm-name', userName.trim()); setNameSet(true); } }} className="text-center max-w-sm w-full">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-8">Climate & Reality TV</p>
          <h2 className="font-display text-3xl text-white mb-6">What's your name?</h2>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your first name" autoFocus
            className="w-full bg-transparent border-b border-white/10 text-white text-center font-body text-lg py-3 outline-none focus:border-amber-500/40 transition-colors placeholder:text-stone-700" />
          <button type="submit" className="mt-6 font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-amber-400 transition-colors">Enter</button>
        </form>
      </div>
    );
  }

  // ── Top bar (shared across all steps) ──
  const topBar = (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] shrink-0">
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            className={`px-3 py-1 rounded-full text-[9px] font-ui tracking-wider whitespace-nowrap transition-all ${
              i === step ? 'bg-amber-500 text-black' :
              i < step ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-white/5 text-stone-500 border border-white/[0.06]'
            }`}>
            {s.label}
          </button>
        ))}
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {currentStep.id === 'dump' && <Timer initialMinutes={4} />}
        <button onClick={exportJSON} className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">Export</button>
        {step < STEPS.length - 1 && (
          <button onClick={() => { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-3 py-1.5 bg-amber-500 text-black rounded-full font-ui text-[9px] tracking-widest uppercase hover:bg-amber-400 transition-colors">
            Next →
          </button>
        )}
        {/* Admin */}
        {isAdmin ? (
          <>
            <button onClick={async () => { setArchives(await apiFetchArchives()); setShowArchivePanel(true); }}
              className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">Archives</button>
            <div className="relative">
              <button onClick={() => setShowArchiveConfirm(!showArchiveConfirm)}
                className="px-3 py-1.5 border border-amber-500/20 rounded-full font-ui text-[9px] tracking-widest uppercase text-amber-400/50 hover:text-amber-400 hover:border-amber-500/40 transition-all">Archive & Reset</button>
              {showArchiveConfirm && (
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 z-50 w-56">
                  <p className="font-body text-[11px] text-stone-400 mb-3">Save and start fresh.</p>
                  <input type="text" value={archiveLabel} onChange={(e) => setArchiveLabel(e.target.value)} placeholder="Session name"
                    className="w-full bg-transparent border-b border-white/10 text-white text-xs font-body py-1.5 mb-3 outline-none focus:border-amber-500/40 placeholder:text-stone-600" />
                  <div className="flex gap-2">
                    <button onClick={handleArchiveAndClear} className="px-3 py-1 bg-amber-500 text-black rounded font-ui text-[9px] tracking-wider uppercase">Archive</button>
                    <button onClick={() => setShowArchiveConfirm(false)} className="px-3 py-1 border border-white/10 text-stone-400 rounded font-ui text-[9px] tracking-wider uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="relative">
            <button onClick={() => setShowAdminPrompt(!showAdminPrompt)}
              className="px-3 py-1.5 border border-white/[0.06] rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-600 hover:text-stone-400 transition-all">Admin</button>
            {showAdminPrompt && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 z-50 w-48">
                <input type="password" value={adminInput} onChange={(e) => setAdminInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (adminInput.toLowerCase().trim() === 'producer390') { sessionStorage.setItem('brainstorm-admin', 'true'); setIsAdmin(true); setShowAdminPrompt(false); setAdminInput(''); } else { setAdminError(true); setTimeout(() => setAdminError(false), 1500); } } }}
                  placeholder="Admin password" autoFocus
                  className={`w-full bg-transparent border-b ${adminError ? 'border-red-500/50' : 'border-white/10'} text-white text-xs font-body py-1.5 outline-none focus:border-amber-500/40 placeholder:text-stone-600`} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Archive side panel ──
  const archivePanel = showArchivePanel && (
    <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em]">Archives</p>
        <button onClick={() => setShowArchivePanel(false)} className="font-ui text-[10px] text-stone-500 hover:text-white transition-colors">Close</button>
      </div>
      {archives.length === 0 ? <p className="font-body text-[11px] text-stone-600">No archives yet.</p> : (
        <div className="space-y-2">
          {archives.map(a => (
            <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5">
              <p className="font-body text-sm text-white mb-1">{a.label}</p>
              <p className="font-ui text-[9px] text-stone-500 mb-2">
                {new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {a.ideaCount} ideas
              </p>
              <div className="flex gap-3">
                <button onClick={async () => { await apiRestoreArchive(a.id); const d = await apiFetch(); if (d) { setGrid(d.grid); setHearts(d.hearts); setPresence(d.presence); } setShowArchivePanel(false); }}
                  className="font-ui text-[9px] text-amber-400/70 hover:text-amber-400 tracking-wider uppercase transition-colors">Restore</button>
                <button onClick={async () => { const d = await apiGetArchiveData(a.id); if (d?.clusters) setViewingArchiveClusters({ label: a.label, clusters: d.clusters }); }}
                  className="font-ui text-[9px] text-stone-500 hover:text-amber-400 tracking-wider uppercase transition-colors">Clusters</button>
                <button onClick={async () => { const d = await apiGetArchiveData(a.id); if (!d) return; const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const el = document.createElement('a'); el.href = u; el.download = `${a.label.replace(/[^a-zA-Z0-9]/g, '-')}.json`; el.click(); URL.revokeObjectURL(u); }}
                  className="font-ui text-[9px] text-stone-500 hover:text-amber-400 tracking-wider uppercase transition-colors">Export</button>
                {confirmDeleteId === a.id ? (
                  <span className="flex gap-2">
                    <button onClick={async () => { await apiDeleteArchive(a.id); setArchives(p => p.filter(x => x.id !== a.id)); setConfirmDeleteId(null); }} className="font-ui text-[9px] text-red-400 tracking-wider uppercase">Confirm</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="font-ui text-[9px] text-stone-600 tracking-wider uppercase">Cancel</button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmDeleteId(a.id)} className="font-ui text-[9px] text-stone-600 hover:text-red-400 tracking-wider uppercase transition-colors">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Clusters side panel ──
  const clustersPanel = viewingArchiveClusters && (
    <div className="w-96 shrink-0 border-r border-white/[0.06] overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em]">Clusters: {viewingArchiveClusters.label}</p>
        <button onClick={() => setViewingArchiveClusters(null)} className="font-ui text-[10px] text-stone-500 hover:text-white transition-colors">Close</button>
      </div>
      {Object.entries(viewingArchiveClusters.clusters).map(([round, clusters]) =>
        Array.isArray(clusters) && clusters.length > 0 && (
          <div key={round} className="mb-6">
            <p className="font-ui text-[9px] text-stone-500 uppercase tracking-[0.2em] mb-3">{round}</p>
            <div className="space-y-3">
              {clusters.map((c: Cluster, i: number) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                  <h3 className="font-display text-white text-sm mb-1"><span className="text-amber-400 mr-2">{i + 1}</span>{c.theme}</h3>
                  <p className="font-body text-[11px] text-stone-400 leading-relaxed mb-2">{c.description}</p>
                  {c.ideas.map(idea => (
                    <p key={idea.id} className="font-body text-[11px] text-stone-300 leading-relaxed">{idea.hearts > 0 ? '\u2764\uFE0F ' : '· '}{idea.text}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );

  // ── Step: Brain Dump ──
  if (currentStep.id === 'dump') {
    const cellIds = buildCellIds('dump', DUMP_ROWS, DUMP_COLS);
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
        {topBar}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display text-2xl text-white">What makes a great reality TV show?</h2>
          <p className="font-body text-sm text-stone-500 mt-1">One idea per post-it. Go fast.</p>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {clustersPanel}
          {archivePanel}
          <div className="flex-1 overflow-auto p-4">{renderGrid(cellIds, DUMP_COLS)}</div>
        </div>
      </div>
    );
  }

  // ── Step: Show individual concept in full (flashy) ──
  if (currentStep.id.startsWith('show-')) {
    const conceptId = currentStep.id.replace('show-', '');
    const concept = showConcepts.find(c => c.id === conceptId)!;
    const cm = staticMedia[concept.id] || { storyboard: [], mood: [] };
    const allImages = [...(cm.storyboard || []), ...(cm.mood || [])];

    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        {/* Hero with image mosaic */}
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
          {allImages.length > 0 && (
            <div className="absolute inset-0 grid grid-cols-3 gap-0">
              {allImages.slice(0, 3).map((src, i) => (
                <div key={i} className="overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/40" />

          {/* Step pills at top */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STEPS.map((s, i) => (
                <button key={s.id} onClick={() => setStep(i)}
                  className={`px-3 py-1 rounded-full text-[9px] font-ui tracking-wider whitespace-nowrap transition-all ${
                    i === step ? 'bg-amber-500 text-black' :
                    i < step ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-black/40 backdrop-blur-sm text-white/60 border border-white/10'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title over image */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-12">
            <div className="max-w-4xl mx-auto">
              <span className="font-ui text-[11px] text-amber-500/70 tracking-widest">{concept.number}</span>
              <h1 className="font-display text-[56px] md:text-[72px] lg:text-[88px] text-white leading-[0.95] tracking-tight mt-2">
                {concept.title}
              </h1>
              {concept.tagline && <p className="font-body text-xl text-stone-300 mt-4 max-w-lg">{concept.tagline}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-12 lg:px-20 pt-16">
          <div className="max-w-4xl mx-auto">
            {/* Logline - big and bold */}
            <p className="font-display text-[28px] md:text-[36px] lg:text-[40px] text-white leading-[1.3] tracking-tight mb-16">{concept.logline}</p>

            {/* Narrative - clean, punchy */}
            <div className="space-y-8 mb-16 max-w-2xl">
              {concept.narrative.map((para, i) => {
                const labelMatch = para.match(/^(ACT ONE|ACT TWO|ACT THREE|THE CRITICAL DESIGN RULE):\s*/i);
                if (labelMatch) {
                  return (
                    <p key={i} className="font-body text-[16px] text-stone-300 leading-[2]">
                      <span className="font-ui text-amber-400 font-semibold tracking-wider uppercase text-[12px]">{labelMatch[1]}:</span>{' '}
                      {para.slice(labelMatch[0].length)}
                    </p>
                  );
                }
                return <p key={i} className="font-body text-[16px] text-stone-300 leading-[2]">{para}</p>;
              })}
            </div>

            {/* Cast - bold cards */}
            <div className="mb-16">
              <p className="font-ui text-[11px] tracking-[0.25em] uppercase text-amber-500/50 mb-6">Who's in it</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {concept.castExamples.map((cast, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-5">
                    <p className="font-ui text-[14px] text-white font-medium mb-3">{cast.label}</p>
                    <p className="font-body text-[13px] text-stone-400 leading-relaxed">{cast.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mechanics - bold blocks */}
            <div className="mb-16 max-w-2xl">
              <p className="font-ui text-[11px] tracking-[0.25em] uppercase text-amber-500/50 mb-6">How it works</p>
              <div className="space-y-8">
                {concept.mechanics.map((mech, i) => (
                  <div key={i}>
                    <p className="font-display text-[18px] text-white mb-2">{mech.title}</p>
                    <p className="font-body text-[15px] text-stone-400 leading-[2]">{mech.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom images */}
            {allImages.length > 3 && (
              <div className="mb-12">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(allImages.length - 3, 3)}, 1fr)` }}>
                  {allImages.slice(3).map((src, i) => (
                    <div key={i} className="h-[200px] rounded-xl overflow-hidden border border-white/[0.06]">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing quote */}
            <div className="border-t border-white/[0.06] pt-12 mb-16">
              <p className="font-display text-2xl md:text-3xl text-white leading-snug tracking-tight italic max-w-2xl">"{concept.closingQuote}"</p>
            </div>

            {/* Next */}
            <div className="text-center pb-16">
              <button onClick={() => { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-8 py-3 bg-amber-500 text-black rounded-full font-ui text-[11px] tracking-widest uppercase hover:bg-amber-400 transition-colors">
                Confirm / Complicate →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Confirm / Complicate per concept ──
  if (currentStep.id.startsWith('feedback-')) {
    const conceptId = currentStep.id.replace('feedback-', '');
    const concept = showConcepts.find(c => c.id === conceptId)!;
    const cellIds = buildCellIds(`fb-${concept.id}`, FEEDBACK_ROWS, FEEDBACK_COLS);
    const filledCount = cellIds.filter(id => (grid[id] || '').trim()).length;

    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
        {topBar}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-2">
              Confirm or complicate <span className="text-stone-600">· {filledCount} notes</span>
            </p>
            <h2 className="font-display text-2xl text-white">{concept.title}</h2>
            <p className="font-body text-sm text-stone-500 mt-1">{concept.logline}</p>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {clustersPanel}
          {archivePanel}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto">
              {renderGrid(cellIds, FEEDBACK_COLS)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Worksheet ──
  if (currentStep.id === 'worksheet') {
    const wsPrefix = `ws-${userId.current}`;
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
        {topBar}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display text-2xl text-white">Design your show</h2>
          <p className="font-body text-sm text-stone-500 mt-1">A reality TV concept that changes climate behavior without saying "climate."</p>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {clustersPanel}
          {archivePanel}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {WORKSHEET_FIELDS.map((field) => {
                const cellId = `${wsPrefix}-${field.id}`;
                return (
                  <div key={field.id}>
                    <label className="font-ui text-[11px] text-amber-400/60 tracking-wider uppercase block mb-2">{field.label}</label>
                    <textarea value={grid[cellId] || ''} onChange={(e) => updateCell(cellId, e.target.value)}
                      onFocus={() => { editingId.current = cellId; }}
                      onBlur={() => { if (editingId.current === cellId) editingId.current = null; }}
                      placeholder={field.placeholder} rows={field.rows}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-[15px] font-body resize-none px-4 py-3 outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10 leading-relaxed placeholder:text-stone-600" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function Timer({ initialMinutes }: { initialMinutes: number }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || seconds <= 0) return; const id = setInterval(() => setSeconds(s => s - 1), 1000); return () => clearInterval(id); }, [running, seconds]);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 60 && seconds > 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-sm tabular-nums ${isLow ? 'text-red-400 animate-pulse' : seconds === 0 ? 'text-red-500' : 'text-stone-300'}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <button onClick={() => setRunning(!running)} className="font-ui text-[9px] tracking-wider uppercase text-stone-500 hover:text-amber-400 transition-colors">
        {running ? 'Pause' : seconds === initialMinutes * 60 ? 'Start' : 'Resume'}
      </button>
      {seconds < initialMinutes * 60 && <button onClick={() => { setSeconds(initialMinutes * 60); setRunning(false); }} className="font-ui text-[9px] tracking-wider uppercase text-stone-600 hover:text-stone-400 transition-colors">Reset</button>}
    </div>
  );
}
