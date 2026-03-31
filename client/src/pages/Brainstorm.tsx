import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const HMW_QUESTIONS = [
  'How might we design a show that turns climate skeptics into climate advocates, without saying a word about climate?',
  'How might we design a reality TV show that creates new climate heroes?',
];

const COLORS = [
  'bg-amber-300',
  'bg-yellow-200',
  'bg-orange-200',
  'bg-lime-200',
  'bg-emerald-200',
  'bg-sky-200',
  'bg-violet-200',
  'bg-pink-200',
];

const ROUND_INSPO: Record<number, { label: string; items: string[] }[]> = {
  0: [
    {
      label: 'Shows that changed minds without trying',
      items: [
        'Queer Eye: five guys do home makeovers, but audiences walked away rethinking masculinity and empathy. No one was "taught" anything.',
        'Undercover Boss: CEOs go undercover as entry-level workers. By the reveal, viewers (and the boss) have genuinely shifted on labor and wages.',
        'Wife Swap: two families with opposite lifestyles trade lives for two weeks. No narrator tells you who is right. Viewers decide.',
        'Gogglebox: people watching TV, reacting. That is the whole show. It quietly normalized diverse British households for millions.',
      ],
    },
    {
      label: 'Formats where the setting does the persuading',
      items: [
        'Survivor: contestants start by exploiting resources, then learn cooperation is the only way to last. The island teaches the lesson.',
        'The Amazing Race: teams race through 30+ countries. Viewers absorb cultures and landscapes without a single geography lecture.',
        'Naked and Afraid: strip away everything modern. Two strangers must cooperate with nature or fail. No script needed.',
        'The Great British Bake Off: a competition that accidentally made kindness cool. The tent, the tone, the lack of cruelty did the work.',
      ],
    },
    {
      label: 'Shows to watch',
      items: [
        'Survivor (CBS): 45 seasons of people forming alliances under scarcity. The original "social experiment" format.',
        'The Mole (Netflix): one contestant secretly sabotages the group. Paranoia and trust as entertainment.',
        'Love Island (ITV): romance as the engine, social dynamics as the story. 10M+ viewers per episode in the UK.',
        'Undercover Boss (CBS): identity reveal format. 40M watched the premiere. People cry every episode.',
        'The Circle (Netflix): players communicate only through text. Catfishing, authenticity, and influence.',
      ],
    },
  ],
  1: [
    {
      label: 'Unlikely climate heroes that already exist',
      items: [
        'Boyan Slat: 18-year-old dropout who built the Ocean Cleanup. Started with a TEDx talk.',
        'Isatou Ceesay: "Queen of Recycling" in Gambia, turned plastic waste into income for women.',
        'Jadav Payeng: one man planted an entire forest in India, larger than Central Park, over 40 years.',
        'Greta Thunberg: went from a solo school strike to addressing the UN in 12 months.',
        'Wangari Maathai: Kenyan woman who won the Nobel Prize for planting 30 million trees.',
      ],
    },
    {
      label: 'What makes someone a hero on TV',
      items: [
        'Vulnerability, not perfection. The best reality TV heroes fail on camera and keep going.',
        'Shark Tank: entrepreneurs become heroes through the pitch, not the product.',
        'MasterChef: the single mom who teaches herself to cook becomes more compelling than the trained chef.',
        'The Amazing Race: ordinary couples become heroes through grit, not talent.',
      ],
    },
    {
      label: 'Hero archetypes',
      items: [
        'The reluctant leader: did not want the spotlight but stepped up when it mattered.',
        'The outsider: underestimated by everyone, proves them wrong through action.',
        'The convert: started on the wrong side, had a genuine change of heart.',
        'The builder: does not talk about change, just builds it with their hands.',
      ],
    },
    {
      label: 'Shows that created heroes',
      items: [
        'Survivor (CBS): Rupert Boneham became a folk hero. Indiana voted him into politics after the show.',
        'American Idol (FOX): Kelly Clarkson, Carrie Underwood. Ordinary people audiences watched become stars.',
        'Queer Eye (Netflix): the Fab Five became cultural icons by being kind on camera.',
        'The Apprentice (NBC): turned business competition into a hero\'s journey format. 28M viewers at peak.',
        'MasterChef (FOX): Christine Ha, a blind home cook, won and became a nationally recognized chef.',
      ],
    },
  ],
};

const GRID_ROWS = 10;
const GRID_COLS = 6;

function buildCellIds(hmwIndex: number): string[] {
  const ids: string[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      ids.push(`hmw${hmwIndex}-r${r}-c${c}`);
    }
  }
  return ids;
}

// Generate a stable user ID per browser session
function getUserId(): string {
  let id = sessionStorage.getItem('brainstorm-uid');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('brainstorm-uid', id);
  }
  return id;
}

// API helpers
type ServerData = {
  grid: Record<string, string>;
  hearts: Record<string, string[]>;
  presence: Record<string, string[]>;
};

async function apiFetch(): Promise<ServerData | null> {
  try {
    const res = await fetch('/api/brainstorm');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function apiUpdateCell(id: string, text: string) {
  try {
    await fetch('/api/brainstorm?action=cell', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text }),
    });
  } catch {}
}

async function apiToggleHeart(cellId: string, userName: string) {
  try {
    const res = await fetch('/api/brainstorm?action=heart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellId, userName }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

async function apiUpdatePresence(userId: string, name: string, cellId: string | null) {
  try {
    await fetch('/api/brainstorm?action=presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, cellId }),
    });
  } catch {}
}

async function apiArchiveAndClear(label: string) {
  try {
    await fetch('/api/brainstorm?action=archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
  } catch {}
}

async function apiFetchArchives(): Promise<{ id: string; label: string; timestamp: string; ideaCount: number }[]> {
  try {
    const res = await fetch('/api/brainstorm?action=archives');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function apiRestoreArchive(archiveId: string) {
  try {
    await fetch('/api/brainstorm?action=restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archiveId }),
    });
  } catch {}
}

async function apiDeleteArchive(archiveId: string) {
  try {
    await fetch(`/api/brainstorm?action=delete-archive&id=${encodeURIComponent(archiveId)}`, {
      method: 'DELETE',
    });
  } catch {}
}

async function apiGetArchiveData(archiveId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/brainstorm?action=archive-data&id=${encodeURIComponent(archiveId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type Cluster = {
  theme: string;
  description: string;
  ideas: { id: string; text: string; hearts: number }[];
};

async function apiCluster(hmwIndex: number): Promise<{ clusters: Cluster[]; message?: string } | null> {
  try {
    const res = await fetch('/api/cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hmwIndex }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const pillBtn = 'px-5 py-2 border border-white/10 rounded-full font-ui text-[10px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all';
const pillBtnActive = 'px-5 py-2 bg-amber-500 text-black rounded-full font-ui text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-colors';

export default function Brainstorm() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'hmw0' | 'canvas0' | 'hmw1' | 'canvas1'>('intro');
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [hearts, setHearts] = useState<Record<string, string[]>>({});
  const [presence, setPresence] = useState<Record<string, string[]>>({});
  const [showInspo, setShowInspo] = useState(false);
  const [userName, setUserName] = useState(() => sessionStorage.getItem('brainstorm-name') || '');
  const [nameSet, setNameSet] = useState(() => !!sessionStorage.getItem('brainstorm-name'));
  const [showArchivePanel, setShowArchivePanel] = useState(false);
  const [archiveLabel, setArchiveLabel] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archives, setArchives] = useState<{ id: string; label: string; timestamp: string; ideaCount: number }[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('brainstorm-admin') === 'true');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [clustering, setClustering] = useState(false);
  const editingId = useRef<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const prevFilledRef = useRef<Set<string>>(new Set());
  const [newCells, setNewCells] = useState<Set<string>>(new Set());
  const userId = useRef(getUserId());

  const hmwIndex = phase === 'canvas0' || phase === 'hmw0' ? 0 : 1;
  const isCanvas = phase === 'canvas0' || phase === 'canvas1';
  const cellIds = buildCellIds(hmwIndex);

  // Load all data on mount
  useEffect(() => {
    apiFetch().then(data => {
      if (data) {
        setGrid(prev => ({ ...prev, ...data.grid }));
        setHearts(data.hearts);
        setPresence(data.presence);
      }
    });
  }, []);

  // Poll server every 2s when on canvas
  useEffect(() => {
    if (!isCanvas) return;
    let active = true;
    const poll = async () => {
      const data = await apiFetch();
      if (data && active) {
        setGrid(prev => {
          const merged = { ...prev, ...data.grid };
          if (editingId.current && prev[editingId.current] !== undefined) {
            merged[editingId.current] = prev[editingId.current];
          }

          // Detect new ideas from others for pulse animation
          const nowFilled = new Set<string>();
          for (const [k, v] of Object.entries(merged)) {
            if (v && v.trim()) nowFilled.add(k);
          }
          const appearing = new Set<string>();
          nowFilled.forEach(k => {
            if (!prevFilledRef.current.has(k)) appearing.add(k);
          });
          prevFilledRef.current = nowFilled;
          if (appearing.size > 0) {
            setNewCells(appearing);
            setTimeout(() => setNewCells(new Set()), 1500);
          }

          return merged;
        });
        setHearts(data.hearts);
        setPresence(data.presence);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [isCanvas]);

  // Send presence heartbeat every 3s when focused on a cell
  useEffect(() => {
    if (!isCanvas || !nameSet) return;
    const interval = setInterval(() => {
      apiUpdatePresence(userId.current, userName, editingId.current);
    }, 3000);
    return () => clearInterval(interval);
  }, [isCanvas, nameSet, userName]);

  // Clear presence on unmount
  useEffect(() => {
    return () => {
      if (nameSet) apiUpdatePresence(userId.current, userName, null);
    };
  }, [nameSet, userName]);

  const updateCell = useCallback((id: string, text: string) => {
    editingId.current = id;
    setGrid(prev => ({ ...prev, [id]: text }));
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => {
      apiUpdateCell(id, text).then(() => {
        if (editingId.current === id) editingId.current = null;
      });
    }, 500);
  }, []);

  const toggleHeart = useCallback((cellId: string) => {
    if (!nameSet) return;
    // Optimistic update
    setHearts(prev => {
      const current = prev[cellId] || [];
      const idx = current.indexOf(userName);
      const updated = idx >= 0
        ? current.filter(n => n !== userName)
        : [...current, userName];
      return { ...prev, [cellId]: updated };
    });
    apiToggleHeart(cellId, userName);
  }, [userName, nameSet]);

  const handleArchiveAndClear = async () => {
    // Cancel all pending save timers so they don't write stale data back
    for (const timer of Object.values(saveTimers.current)) {
      clearTimeout(timer);
    }
    saveTimers.current = {};
    editingId.current = null;
    prevFilledRef.current = new Set();

    const label = archiveLabel.trim() || new Date().toLocaleString();
    await apiArchiveAndClear(label);
    setGrid({});
    setHearts({});
    setPresence({});
    setNewCells(new Set());
    setArchiveLabel('');
    setShowArchiveConfirm(false);
    // Refresh archives list
    const list = await apiFetchArchives();
    setArchives(list);
  };

  const handleRestore = async (archiveId: string) => {
    await apiRestoreArchive(archiveId);
    const data = await apiFetch();
    if (data) {
      setGrid(data.grid);
      setHearts(data.hearts);
      setPresence(data.presence);
    }
    setShowArchivePanel(false);
  };

  const loadArchives = async () => {
    const list = await apiFetchArchives();
    setArchives(list);
    setShowArchivePanel(true);
  };

  const handleDeleteArchive = async (archiveId: string) => {
    await apiDeleteArchive(archiveId);
    setArchives(prev => prev.filter(a => a.id !== archiveId));
    setConfirmDeleteId(null);
  };

  const exportArchive = async (archiveId: string, label: string) => {
    const data = await apiGetArchiveData(archiveId);
    if (!data) return;
    const exportData = HMW_QUESTIONS.map((question, idx) => {
      const ids = buildCellIds(idx);
      const ideas = ids
        .map(id => {
          const text = (data.grid[id] || '').trim();
          if (!text) return null;
          const cellHearts = data.hearts?.[id] || [];
          return { text, hearts: cellHearts.length, heartedBy: cellHearts };
        })
        .filter(Boolean);
      return { question, ideas };
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/[^a-zA-Z0-9]/g, '-')}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const exportData = HMW_QUESTIONS.map((question, idx) => {
      const ids = buildCellIds(idx);
      const ideas = ids
        .map(id => {
          const text = (grid[id] || '').trim();
          if (!text) return null;
          const cellHearts = hearts[id] || [];
          return { text, hearts: cellHearts.length, heartedBy: cellHearts };
        })
        .filter(Boolean);
      return { question, ideas };
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstorm-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = [['Round', 'Question', 'Idea', 'Hearts', 'Hearted By']];
    HMW_QUESTIONS.forEach((question, idx) => {
      const ids = buildCellIds(idx);
      ids.forEach(id => {
        const text = (grid[id] || '').trim();
        if (!text) return;
        const cellHearts = hearts[id] || [];
        rows.push([
          `Round ${idx + 1}`,
          question,
          text,
          String(cellHearts.length),
          cellHearts.join('; '),
        ]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstorm-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCluster = async () => {
    setClustering(true);
    const result = await apiCluster(hmwIndex);
    if (result && result.clusters) {
      setClusters(result.clusters);
      setShowClusters(true);
    }
    setClustering(false);
  };


  // ── Name entry gate ──
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (userName.trim()) {
              const name = userName.trim();
              setUserName(name);
              sessionStorage.setItem('brainstorm-name', name);
              setNameSet(true);
            }
          }}
          className="text-center max-w-sm w-full"
        >
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-8">
            Climate & Reality TV
          </p>
          <h2 className="font-display text-3xl text-white mb-6">What's your name?</h2>
          <p className="font-body text-stone-500 text-sm mb-8">
            So others can see who's typing and whose hearts are whose.
          </p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your first name"
            autoFocus
            className="w-full bg-transparent border-b border-white/10 text-white text-center font-body text-lg py-3 outline-none focus:border-amber-500/40 transition-colors placeholder:text-stone-700"
          />
          <button
            type="submit"
            className="mt-6 font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-amber-400 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  // ── Intro screen ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-6 py-16 overflow-auto">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-8">
            Climate & Reality TV
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white text-center leading-tight mb-6">
            Brainstorm
          </h1>
          <p className="font-body text-stone-400 text-center max-w-lg text-lg leading-relaxed mb-4">
            We'll explore two "How Might We" questions. For each one, you'll have 10 minutes of heads-down ideation. Type your ideas into the grid, then we'll share back and discuss.
          </p>
          <p className="font-body text-stone-500 text-center max-w-md text-sm leading-relaxed mb-12">
            First, let's look at the show concepts for context.
          </p>
          <div className="flex gap-3 mb-16">
            <button onClick={() => navigate('/concepts')} className={pillBtn}>
              View Concepts
            </button>
            <button onClick={() => setPhase('hmw0')} className={pillBtnActive}>
              Start Brainstorm
            </button>
          </div>
          <button onClick={() => navigate('/concepts')} className={pillBtn}>
            ← Back to Concepts
          </button>
        </div>
      </div>
    );
  }

  // ── HMW reveal screen ──
  if (phase === 'hmw0' || phase === 'hmw1') {
    const idx = phase === 'hmw0' ? 0 : 1;
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-12">
          Round {idx + 1} of 2
        </p>
        <p className="font-ui text-[11px] text-stone-500 uppercase tracking-[0.2em] mb-6">
          How Might We...
        </p>
        <h2 className="font-display text-4xl md:text-6xl text-white text-center leading-tight max-w-4xl mb-16">
          {HMW_QUESTIONS[idx]}
        </h2>
        <button onClick={() => setPhase(idx === 0 ? 'canvas0' : 'canvas1')} className={pillBtnActive}>
          Open Board
        </button>
        <button
          onClick={() => setPhase(idx === 0 ? 'intro' : 'canvas0')}
          className="mt-4 font-ui text-[10px] text-stone-600 tracking-wider uppercase hover:text-stone-400 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Grid Canvas ──
  const roundInspo = ROUND_INSPO[hmwIndex] || [];
  const filledCount = cellIds.filter(id => (grid[id] || '').trim().length > 0).length;

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => setPhase(phase === 'canvas0' ? 'hmw0' : 'hmw1')}
            className="font-ui text-[10px] text-stone-500 hover:text-amber-400 transition-colors shrink-0"
          >
            ←
          </button>
          <p className="font-display text-white text-base md:text-lg truncate leading-snug">
            {HMW_QUESTIONS[hmwIndex]}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="font-ui text-[9px] text-stone-500 tracking-wider">
            {filledCount} ideas
          </span>
          <Timer />
          <button
            onClick={() => setShowInspo(!showInspo)}
            className={`px-3 py-1.5 border rounded-full font-ui text-[9px] tracking-widest uppercase transition-all ${
              showInspo
                ? 'border-amber-500/40 text-amber-400'
                : 'border-white/10 text-stone-500 hover:text-amber-400 hover:border-amber-500/30'
            }`}
          >
            Inspo
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            JSON
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            CSV
          </button>
          <button
            onClick={handleCluster}
            disabled={clustering}
            className={`px-3 py-1.5 border rounded-full font-ui text-[9px] tracking-widest uppercase transition-all ${
              clustering
                ? 'border-amber-500/40 text-amber-400 animate-pulse cursor-wait'
                : showClusters
                  ? 'border-amber-500/40 text-amber-400'
                  : 'border-white/10 text-stone-400 hover:text-amber-400 hover:border-amber-500/30'
            }`}
          >
            {clustering ? 'Clustering...' : 'Cluster'}
          </button>
          <button
            onClick={() => phase === 'canvas0' ? setPhase('hmw1') : setPhase('intro')}
            className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            {phase === 'canvas0' ? 'Next Round' : 'Done'}
          </button>
          {isAdmin ? (
            <>
              <button
                onClick={loadArchives}
                className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
              >
                Archives
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowArchiveConfirm(!showArchiveConfirm)}
                  className="px-3 py-1.5 border border-amber-500/20 rounded-full font-ui text-[9px] tracking-widest uppercase text-amber-400/50 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                >
                  Archive & Reset
                </button>
                {showArchiveConfirm && (
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 z-50 w-56">
                    <p className="font-body text-[11px] text-stone-400 mb-3">Save current board to archives and start fresh.</p>
                    <input
                      type="text"
                      value={archiveLabel}
                      onChange={(e) => setArchiveLabel(e.target.value)}
                      placeholder="Session name (optional)"
                      className="w-full bg-transparent border-b border-white/10 text-white text-xs font-body py-1.5 mb-3 outline-none focus:border-amber-500/40 placeholder:text-stone-600"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleArchiveAndClear}
                        className="px-3 py-1 bg-amber-500 text-black rounded font-ui text-[9px] tracking-wider uppercase hover:bg-amber-400 transition-colors"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => setShowArchiveConfirm(false)}
                        className="px-3 py-1 border border-white/10 text-stone-400 rounded font-ui text-[9px] tracking-wider uppercase hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowAdminPrompt(!showAdminPrompt)}
                className="px-3 py-1.5 border border-white/[0.06] rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-600 hover:text-stone-400 transition-all"
              >
                Admin
              </button>
              {showAdminPrompt && (
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 z-50 w-48">
                  <input
                    type="password"
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (adminInput.toLowerCase().trim() === 'producer390') {
                          sessionStorage.setItem('brainstorm-admin', 'true');
                          setIsAdmin(true);
                          setShowAdminPrompt(false);
                          setAdminInput('');
                        } else {
                          setAdminError(true);
                          setTimeout(() => setAdminError(false), 1500);
                        }
                      }
                    }}
                    placeholder="Admin password"
                    autoFocus
                    className={`w-full bg-transparent border-b ${adminError ? 'border-red-500/50' : 'border-white/10'} text-white text-xs font-body py-1.5 outline-none focus:border-amber-500/40 placeholder:text-stone-600`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Inspiration sidebar */}
        {/* Clusters panel */}
        {showClusters && clusters.length > 0 && (
          <div className="w-96 shrink-0 border-r border-white/[0.06] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em]">
                Idea Clusters
              </p>
              <button
                onClick={() => setShowClusters(false)}
                className="font-ui text-[10px] text-stone-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              {clusters.map((cluster, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-display text-lg">{i + 1}</span>
                    <h3 className="font-display text-white text-sm">{cluster.theme}</h3>
                  </div>
                  <p className="font-body text-[11px] text-stone-400 leading-relaxed mb-3">
                    {cluster.description}
                  </p>
                  <div className="space-y-1.5">
                    {cluster.ideas.map((idea) => (
                      <div key={idea.id} className="flex items-start gap-2">
                        <span className="text-[10px] text-stone-600 mt-0.5 shrink-0">
                          {idea.hearts > 0 ? `${'❤️'.repeat(Math.min(idea.hearts, 3))}` : '·'}
                        </span>
                        <p className="font-body text-[11px] text-stone-300 leading-relaxed">{idea.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archives panel */}
        {showArchivePanel && (
          <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em]">
                Archives
              </p>
              <button
                onClick={() => setShowArchivePanel(false)}
                className="font-ui text-[10px] text-stone-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
            {archives.length === 0 ? (
              <p className="font-body text-[11px] text-stone-600">No archived sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {archives.map(a => (
                  <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <p className="font-body text-sm text-white mb-1">{a.label}</p>
                    <p className="font-ui text-[9px] text-stone-500 mb-2">
                      {new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {' \u00B7 '}{a.ideaCount} ideas
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRestore(a.id)}
                        className="font-ui text-[9px] text-amber-400/70 hover:text-amber-400 tracking-wider uppercase transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => exportArchive(a.id, a.label)}
                        className="font-ui text-[9px] text-stone-500 hover:text-amber-400 tracking-wider uppercase transition-colors"
                      >
                        Export
                      </button>
                      {confirmDeleteId === a.id ? (
                        <span className="flex gap-2">
                          <button
                            onClick={() => handleDeleteArchive(a.id)}
                            className="font-ui text-[9px] text-red-400 tracking-wider uppercase"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="font-ui text-[9px] text-stone-600 tracking-wider uppercase hover:text-stone-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(a.id)}
                          className="font-ui text-[9px] text-stone-600 hover:text-red-400 tracking-wider uppercase transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showInspo && (
          <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto p-4 space-y-5">
            {roundInspo.map((group) => (
              <div key={group.label}>
                <p className="font-ui text-[9px] text-amber-500/50 uppercase tracking-[0.2em] mb-2">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5"
                    >
                      <p className="font-body text-[11px] text-stone-400 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              gridAutoRows: '140px',
            }}
          >
            {cellIds.map((id, i) => {
              const color = COLORS[i % COLORS.length];
              const text = grid[id] || '';
              const cellHearts = hearts[id] || [];
              const hearted = cellHearts.includes(userName);
              const cellPresence = (presence[id] || []).filter(n => n !== userName);
              const isNew = newCells.has(id);
              const hasText = text.trim().length > 0;

              return (
                <div
                  key={id}
                  id={`cell-${id}`}
                  className={`${color} rounded-lg shadow-md flex flex-col overflow-hidden relative transition-all duration-300 ${
                    isNew ? 'ring-2 ring-amber-400 scale-[1.02]' : ''
                  }`}
                >
                  {/* Presence indicators */}
                  {cellPresence.length > 0 && (
                    <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                      {cellPresence.map(name => (
                        <span
                          key={name}
                          className="bg-black/20 text-black/60 text-[8px] font-ui px-1.5 py-0.5 rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Textarea */}
                  <textarea
                    value={text}
                    onChange={(e) => updateCell(id, e.target.value)}
                    onFocus={() => {
                      editingId.current = id;
                      apiUpdatePresence(userId.current, userName, id);
                    }}
                    onBlur={() => {
                      if (editingId.current === id) editingId.current = null;
                      apiUpdatePresence(userId.current, userName, null);
                    }}
                    placeholder="Type your idea..."
                    className="flex-1 w-full bg-transparent text-black/80 text-sm font-body resize-none px-3 pt-2.5 pb-1 outline-none placeholder:text-black/20 leading-relaxed"
                  />

                  {/* Heart button */}
                  {hasText && (
                    <div className="flex items-center justify-between px-3 pb-2">
                      <button
                        onClick={() => toggleHeart(id)}
                        className={`flex items-center gap-1 text-xs transition-all ${
                          hearted
                            ? 'text-red-500 scale-110'
                            : 'text-black/25 hover:text-red-400'
                        }`}
                      >
                        <span>{hearted ? '\u2764\uFE0F' : '\u2661'}</span>
                        {cellHearts.length > 0 && (
                          <span className="text-[10px] font-ui">{cellHearts.length}</span>
                        )}
                      </button>
                      {cellHearts.length > 0 && (
                        <span className="text-[8px] text-black/30 font-ui truncate max-w-[80px]">
                          {cellHearts.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Timer() {
  const [seconds, setSeconds] = useState(10 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 60 && seconds > 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-sm tabular-nums ${
          isLow ? 'text-red-400 animate-pulse' : seconds === 0 ? 'text-red-500' : 'text-stone-300'
        }`}
      >
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <button
        onClick={() => setRunning(!running)}
        className="font-ui text-[9px] tracking-wider uppercase text-stone-500 hover:text-amber-400 transition-colors"
      >
        {running ? 'Pause' : seconds === 10 * 60 ? 'Start' : 'Resume'}
      </button>
      {seconds < 10 * 60 && (
        <button
          onClick={() => { setSeconds(10 * 60); setRunning(false); }}
          className="font-ui text-[9px] tracking-wider uppercase text-stone-600 hover:text-stone-400 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
