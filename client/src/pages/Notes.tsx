import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSession, updateSession } from '../lib/api';

interface Session {
  id: string;
  participantName: string;
  participantRole: string;
  organization: string;
  openingNotes: string;
  [key: string]: any;
}

export default function Notes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchSession(id).then(s => {
      if (!s) { navigate('/'); return; }
      setSession(s);
      setNotes(s.openingNotes || '');
    });
  }, [id, navigate]);

  const autoSave = (value: string) => {
    setNotes(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!session || !id) return;
      updateSession(id, { ...session, openingNotes: value }).then(setSession).catch(() => {});
    }, 800);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ── Interviewee-facing top section ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pt-16 pb-8">
        <div className="max-w-2xl w-full text-center mb-12">
          <p className="font-ui text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-6">
            Climate & Reality TV · GEN 390
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-4">
            {session.participantName}
          </h1>
          <p className="font-ui text-sm text-stone-400">
            {session.participantRole}{session.organization ? ` at ${session.organization}` : ''}
          </p>
          <div className="w-12 h-[1px] bg-amber-500/30 mx-auto mt-8" />
        </div>

        {/* The notepad -- clean, minimal, they see you typing */}
        <div className="max-w-2xl w-full">
          <textarea
            value={notes}
            onChange={(e) => autoSave(e.target.value)}
            className="w-full min-h-[350px] text-[16px] text-stone-300 bg-transparent border-none outline-none resize-y font-body leading-[2] placeholder:text-stone-700"
            placeholder=""
            autoFocus
          />
        </div>
      </div>

      {/* ── Bottom nav bar (subtle, interviewer-only feel) ──────────────── */}
      <div className="px-6 md:px-12 lg:px-20 py-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="font-ui text-[10px] text-stone-600 tracking-wider uppercase hover:text-stone-400 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => navigate(`/interview/${id}/concepts`)}
            className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-amber-400 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
