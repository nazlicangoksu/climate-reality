import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  participantName: string;
  participantRole: string;
  organization: string;
  closingNotes: string;
  endTime: string | null;
  [key: string]: any;
}

export default function EndInterview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState('');
  const [ended, setEnded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(s => {
      setSession(s);
      setNotes(s.closingNotes || '');
      setEnded(!!s.endTime);
    }).catch(() => navigate('/'));
  }, [id, navigate]);

  const autoSave = (value: string) => {
    setNotes(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!session) return;
      fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, closingNotes: value }),
      }).then(r => r.json()).then(setSession).catch(() => {});
    }, 800);
  };

  const endInterview = async () => {
    if (!session) return;
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, closingNotes: notes, endTime: new Date().toISOString() }),
    });
    if (res.ok) {
      setEnded(true);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/interview/${id}/ideas`)}
            className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors"
          >
            ← Ideas
          </button>
          <div className="flex items-center gap-2">
            <span className="font-ui text-[10px] text-stone-500 tracking-wider">
              {session.participantName}
            </span>
            {!ended && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
        </div>

        <div className="mb-12">
          <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-3">Wrap Up</p>
          <h1 className="font-display text-3xl md:text-4xl text-white leading-tight tracking-tight">
            Closing Notes
          </h1>
        </div>

        {/* Closing notes */}
        <div className="mb-8">
          <p className="font-ui text-[11px] text-stone-500 mb-4">
            Post-interview reflections. What stood out? What surprised you? What should you follow up on?
          </p>
          <textarea
            value={notes}
            onChange={(e) => autoSave(e.target.value)}
            className="w-full min-h-[300px] text-[15px] text-stone-300 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-6 py-5 resize-y focus:outline-none focus:border-amber-500/30 font-body leading-[1.9] placeholder:text-stone-600"
            placeholder="What were the key takeaways?
What surprised you about their reactions?
Which concept resonated most and why?
What new ideas came up that you hadn't considered?
Any follow-up actions?"
            disabled={ended}
          />
        </div>

        {/* End interview */}
        {!ended ? (
          <div className="flex justify-between items-center pt-8 border-t border-white/[0.06]">
            <button
              onClick={() => navigate(`/interview/${id}/ideas`)}
              className="font-ui text-[10px] text-stone-400 tracking-wider uppercase hover:text-white transition-colors"
            >
              ← Back to Ideas
            </button>
            <button
              onClick={endInterview}
              className="px-8 py-3 bg-white text-black font-ui text-xs tracking-wider uppercase rounded-full hover:bg-stone-200 transition-colors"
            >
              End Interview
            </button>
          </div>
        ) : (
          <div className="text-center py-12 border-t border-white/[0.06]">
            <p className="font-display text-2xl text-white mb-4">Interview complete.</p>
            <p className="font-body text-sm text-stone-500 mb-8">
              Ended {new Date(session.endTime!).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/interview/${id}/summary`)}
                className="px-6 py-2.5 bg-amber-500 text-black font-ui text-xs tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
              >
                View Summary
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 font-ui text-xs tracking-wider uppercase text-stone-400 border border-white/10 rounded-full hover:text-white hover:border-white/20 transition-colors"
              >
                All Interviews
              </button>
              <button
                onClick={() => navigate('/synthesis')}
                className="px-6 py-2.5 font-ui text-xs tracking-wider uppercase text-stone-400 border border-white/10 rounded-full hover:text-white hover:border-white/20 transition-colors"
              >
                Synthesis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
