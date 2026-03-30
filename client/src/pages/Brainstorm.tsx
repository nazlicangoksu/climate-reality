import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HMW_QUESTIONS = [
  'How might we design a show format that turns climate skeptics into climate advocates, without saying a word about climate?',
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

interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  hmwIndex: number;
}

const STORAGE_KEY = 'climate-reality-brainstorm';

function loadNotes(): StickyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: StickyNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function Brainstorm() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'hmw0' | 'canvas0' | 'hmw1' | 'canvas1'>('intro');
  const [notes, setNotes] = useState<StickyNote[]>(loadNotes);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const colorIndex = useRef(0);

  const hmwIndex = phase === 'canvas0' || phase === 'hmw0' ? 0 : 1;

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = () => {
    const color = COLORS[colorIndex.current % COLORS.length];
    colorIndex.current++;
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.clientWidth / 2 : 400;
    const cy = canvas ? canvas.clientHeight / 2 : 300;
    // scatter around center
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
  };

  const updateText = (id: string, text: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
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
    setDragging(null);
  }, []);

  const filteredNotes = notes.filter(n => n.hmwIndex === hmwIndex);
  const isCanvas = phase === 'canvas0' || phase === 'canvas1';

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
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
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/concepts')}
            className="px-8 py-3 border border-white/10 rounded-full font-ui text-[11px] tracking-widest uppercase text-stone-300 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            View Concepts
          </button>
          <button
            onClick={() => setPhase('hmw0')}
            className="px-8 py-3 bg-amber-500 text-black rounded-full font-ui text-[11px] tracking-widest uppercase hover:bg-amber-400 transition-colors"
          >
            Start Brainstorm
          </button>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-8 font-ui text-[10px] text-stone-600 tracking-wider uppercase hover:text-stone-400 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // HMW reveal screen
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
        <h2 className="font-display text-3xl md:text-5xl text-white text-center leading-tight max-w-3xl mb-16">
          {HMW_QUESTIONS[idx]}
        </h2>
        <button
          onClick={() => setPhase(idx === 0 ? 'canvas0' : 'canvas1')}
          className="px-10 py-3 bg-amber-500 text-black rounded-full font-ui text-[11px] tracking-widest uppercase hover:bg-amber-400 transition-colors"
        >
          Start 10 Minutes
        </button>
      </div>
    );
  }

  // Canvas
  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em] shrink-0">
            Round {hmwIndex + 1}/2
          </p>
          <p className="font-body text-stone-400 text-sm truncate italic">
            "{HMW_QUESTIONS[hmwIndex]}"
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Timer />
          <button
            onClick={addNote}
            className="px-4 py-2 bg-amber-500 text-black rounded-full font-ui text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-colors"
          >
            + Add Note
          </button>
          {phase === 'canvas0' ? (
            <button
              onClick={() => setPhase('hmw1')}
              className="px-4 py-2 border border-white/10 rounded-full font-ui text-[10px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            >
              Next Round →
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-white/10 rounded-full font-ui text-[10px] tracking-widest uppercase text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>

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
            {/* Drag handle */}
            <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-black/20" />
                <span className="w-1 h-1 rounded-full bg-black/20" />
                <span className="w-1 h-1 rounded-full bg-black/20" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
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
          onClick={() => {
            setSeconds(10 * 60);
            setRunning(false);
          }}
          className="font-ui text-[9px] tracking-wider uppercase text-stone-600 hover:text-stone-400 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
