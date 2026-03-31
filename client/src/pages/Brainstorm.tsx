import { useState, useRef, useCallback, useEffect } from 'react';
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

// Contextual inspiration per HMW round
const ROUND_INSPO: Record<number, { label: string; items: string[] }[]> = {
  0: [
    {
      label: 'Reality shows that changed how people think',
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
  ],
  1: [
    {
      label: 'Unlikely climate heroes that already exist',
      items: [
        'Boyan Slat: 18-year-old dropout who built the Ocean Cleanup. Started with a TEDx talk.',
        'Isatou Ceesay: "Queen of Recycling" in Gambia, turned plastic waste into income for women',
        'Jadav Payeng: one man planted an entire forest in India, larger than Central Park, over 40 years',
        'Greta Thunberg went from a solo school strike to addressing the UN in 12 months',
        'Wangari Maathai: Kenyan woman who won the Nobel Prize for planting 30 million trees',
      ],
    },
    {
      label: 'What makes someone a hero on TV',
      items: [
        'Vulnerability, not perfection. The best reality TV heroes fail on camera and keep going.',
        'Shark Tank: entrepreneurs become heroes through the pitch, not the product',
        'Survivor: the hero is whoever navigates social politics with integrity under pressure',
        'The Amazing Race: ordinary couples become heroes through grit, not talent',
        'MasterChef: the single mom who teaches herself to cook becomes more compelling than the trained chef',
      ],
    },
    {
      label: 'Archetypes that resonate',
      items: [
        'The reluctant leader: did not want the spotlight but stepped up when it mattered',
        'The outsider: underestimated by everyone, proves them wrong through action',
        'The convert: started on the wrong side, had a genuine change of heart',
        'The builder: does not talk about change, just builds it with their hands',
      ],
    },
  ],
};

interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  hmwIndex: number;
}

const STORAGE_KEY = 'climate-reality-brainstorm';

function loadLocalNotes(): StickyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: StickyNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

async function apiFetchNotes(): Promise<StickyNote[] | null> {
  try {
    const res = await fetch('/api/brainstorm');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function apiSaveNote(note: StickyNote): Promise<boolean> {
  try {
    const res = await fetch('/api/brainstorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiUpdateNote(note: StickyNote): Promise<boolean> {
  try {
    const res = await fetch('/api/brainstorm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiDeleteNote(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/brainstorm?id=${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

const pillBtn = 'px-5 py-2 border border-white/10 rounded-full font-ui text-[10px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all';
const pillBtnActive = 'px-5 py-2 bg-amber-500 text-black rounded-full font-ui text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-colors';

export default function Brainstorm() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'hmw0' | 'canvas0' | 'hmw1' | 'canvas1'>('intro');
  const [notes, setNotes] = useState<StickyNote[]>(loadLocalNotes);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showInspo, setShowInspo] = useState(false);
  const [useApi, setUseApi] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const colorIndex = useRef(0);
  const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hmwIndex = phase === 'canvas0' || phase === 'hmw0' ? 0 : 1;
  const isCanvas = phase === 'canvas0' || phase === 'canvas1';

  useEffect(() => {
    saveLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (!isCanvas) return;
    let active = true;
    const poll = async () => {
      const serverNotes = await apiFetchNotes();
      if (serverNotes !== null && active) {
        setUseApi(true);
        setNotes(prev => {
          const serverMap = new Map(serverNotes.map(n => [n.id, n]));
          const localMap = new Map(prev.map(n => [n.id, n]));
          const merged = serverNotes.map(sn => {
            const local = localMap.get(sn.id);
            if (local && dragging === sn.id) return { ...sn, x: local.x, y: local.y };
            return sn;
          });
          prev.forEach(ln => {
            if (!serverMap.has(ln.id)) merged.push(ln);
          });
          return merged;
        });
      } else if (serverNotes === null) {
        setUseApi(false);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [isCanvas, dragging]);

  const addNote = async () => {
    const color = COLORS[colorIndex.current % COLORS.length];
    colorIndex.current++;
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.clientWidth / 2 : 400;
    const cy = canvas ? canvas.clientHeight / 2 : 300;
    const x = cx - 80 + (Math.random() - 0.5) * 300;
    const y = cy - 60 + (Math.random() - 0.5) * 200;
    const note: StickyNote = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: '',
      x: Math.max(0, x),
      y: Math.max(0, y),
      color,
      hmwIndex,
    };
    setNotes(prev => [...prev, note]);
    if (useApi) apiSaveNote(note);
  };

  const updateText = (id: string, text: string) => {
    setNotes(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, text } : n));
      if (useApi) {
        if (updateTimer.current) clearTimeout(updateTimer.current);
        updateTimer.current = setTimeout(() => {
          const note = updated.find(n => n.id === id);
          if (note) apiUpdateNote(note);
        }, 500);
      }
      return updated;
    });
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (useApi) apiDeleteNote(id);
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      e.preventDefault();
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDragging(id);
      setDragOffset({
        x: e.clientX - rect.left - note.x,
        y: e.clientY - rect.top - note.y,
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [notes]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
      setNotes(prev => prev.map(n => (n.id === dragging ? { ...n, x, y } : n)));
    },
    [dragging, dragOffset]
  );

  const onPointerUp = useCallback(() => {
    if (dragging) {
      const note = notes.find(n => n.id === dragging);
      if (note && useApi) apiUpdateNote(note);
    }
    setDragging(null);
  }, [dragging, notes, useApi]);

  const filteredNotes = notes.filter(n => n.hmwIndex === hmwIndex);

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
            We'll explore two "How Might We" questions. For each one, you'll have 10 minutes of heads-down ideation. Write as many ideas as you can on sticky notes, then we'll share back and cluster them together.
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

          <button onClick={() => navigate('/')} className={pillBtn}>
            ← Back to Dashboard
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

  // ── Canvas ──
  const roundInspo = ROUND_INSPO[hmwIndex] || [];

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
          <button onClick={addNote} className="px-3 py-1.5 bg-amber-500 text-black rounded-full font-ui text-[9px] tracking-widest uppercase hover:bg-amber-400 transition-colors">
            + Note
          </button>
          <button
            onClick={() => phase === 'canvas0' ? setPhase('hmw1') : navigate('/')}
            className="px-3 py-1.5 border border-white/10 rounded-full font-ui text-[9px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            {phase === 'canvas0' ? 'Next →' : 'Done'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Inspiration sidebar */}
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

        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto cursor-crosshair"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={(e) => {
            if (e.target === canvasRef.current) addNote();
          }}
        >
          {filteredNotes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="font-body text-stone-600 text-lg italic">
                Click "+ Add Note" or double-click anywhere to start
              </p>
            </div>
          )}
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`absolute w-44 min-h-[120px] ${note.color} rounded-md shadow-lg cursor-grab active:cursor-grabbing select-none flex flex-col`}
              style={{ left: note.x, top: note.y, zIndex: dragging === note.id ? 50 : 10 }}
              onPointerDown={(e) => onPointerDown(e, note.id)}
            >
              <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-black/20" />
                  <span className="w-1 h-1 rounded-full bg-black/20" />
                  <span className="w-1 h-1 rounded-full bg-black/20" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="text-black/30 hover:text-black/70 text-xs leading-none"
                >
                  ×
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => updateText(note.id, e.target.value)}
                placeholder="Type your idea..."
                className="flex-1 bg-transparent text-black/80 text-sm font-body resize-none px-2.5 pb-2.5 pt-1 outline-none placeholder:text-black/30 leading-relaxed"
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          ))}
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
