import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSessions, createSession, deleteSession } from '../lib/api';

interface Session {
  id: string;
  participantName: string;
  participantRole: string;
  organization: string;
  startTime: string;
  endTime: string | null;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ participantName: '', participantRole: '', organization: '', context: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions().then(setSessions).catch(() => {});
  }, []);

  const startInterview = async () => {
    if (!form.participantName.trim()) return;
    const session = await createSession(form);
    navigate(`/interview/${session.id}/notes`);
  };

  const resumeInterview = (id: string, ended: boolean) => {
    if (ended) {
      navigate(`/interview/${id}/summary`);
    } else {
      navigate(`/interview/${id}/notes`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete interview with ${name}?`)) return;
    await deleteSession(id);
    setSessions(sessions.filter(s => s.id !== id));
  };

  const completed = sessions.filter(s => s.endTime);
  const inProgress = sessions.filter(s => !s.endTime);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-3">
            Climate & Reality TV
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight tracking-tight">
            Research Hub
          </h1>
        </div>

        {/* Two main paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          <button
            onClick={() => setShowNew(true)}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-left hover:border-amber-500/30 hover:bg-white/[0.05] transition-all group"
          >
            <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em] mb-3">1:1</p>
            <p className="font-display text-2xl text-white mb-2 group-hover:text-amber-50 transition-colors">
              Interview
            </p>
            <p className="font-body text-sm text-stone-500 leading-relaxed">
              Walk an interviewee through the concepts, capture reactions and ideas.
            </p>
          </button>

          <button
            onClick={() => navigate('/brainstorm')}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-left hover:border-amber-500/30 hover:bg-white/[0.05] transition-all group"
          >
            <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.2em] mb-3">Group</p>
            <p className="font-display text-2xl text-white mb-2 group-hover:text-amber-50 transition-colors">
              Brainstorm
            </p>
            <p className="font-body text-sm text-stone-500 leading-relaxed">
              Two HMW rounds with sticky notes. Show concepts, ideate, cluster.
            </p>
          </button>
        </div>

        {/* Quick links */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => navigate('/concepts')}
            className="font-ui text-[10px] tracking-widest uppercase text-stone-500 hover:text-amber-400 transition-colors px-4 py-2 border border-white/[0.06] rounded-full hover:border-amber-500/30"
          >
            Concepts
          </button>
          <button
            onClick={() => navigate('/synthesis')}
            className="font-ui text-[10px] tracking-widest uppercase text-stone-500 hover:text-amber-400 transition-colors px-4 py-2 border border-white/[0.06] rounded-full hover:border-amber-500/30"
          >
            Synthesis
          </button>
        </div>

        {/* New interview form */}
        {showNew && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-12">
            <p className="font-display text-xl text-white mb-6">New Interview</p>
            <div className="space-y-4">
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">
                  Interviewee Name *
                </label>
                <input
                  value={form.participantName}
                  onChange={(e) => setForm({ ...form, participantName: e.target.value })}
                  className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                  placeholder="Full name"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Role</label>
                  <input
                    value={form.participantRole}
                    onChange={(e) => setForm({ ...form, participantRole: e.target.value })}
                    className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                    placeholder="e.g., Producer, Network Exec"
                  />
                </div>
                <div>
                  <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Organization</label>
                  <input
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                    placeholder="e.g., Netflix, NGO, Independent"
                  />
                </div>
              </div>
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Context</label>
                <input
                  value={form.context}
                  onChange={(e) => setForm({ ...form, context: e.target.value })}
                  className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                  placeholder="How do you know them? Why this interview?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={startInterview}
                  className="px-6 py-2.5 bg-amber-500 text-black font-ui text-xs tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
                >
                  Start Interview
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-6 py-2.5 font-ui text-xs tracking-wider uppercase text-stone-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-progress interviews */}
        {inProgress.length > 0 && (
          <div className="mb-12">
            <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-4">In Progress</p>
            <div className="space-y-3">
              {inProgress.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => resumeInterview(s.id, false)}
                    className="flex-1 text-left bg-white/[0.03] border border-amber-500/20 rounded-xl p-5 hover:bg-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-ui text-sm text-white">{s.participantName}</p>
                        <p className="font-ui text-[11px] text-stone-500 mt-0.5">
                          {s.participantRole}{s.organization ? ` · ${s.organization}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-ui text-[10px] text-amber-400/70 tracking-wider uppercase group-hover:text-amber-400">
                          Resume
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.participantName)}
                    className="shrink-0 w-9 h-9 rounded-lg border border-white/[0.06] text-stone-600 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed interviews */}
        {completed.length > 0 && (
          <div>
            <p className="font-ui text-[10px] text-stone-500 tracking-[0.25em] uppercase mb-4">
              Completed ({completed.length})
            </p>
            <div className="space-y-2">
              {completed.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => resumeInterview(s.id, true)}
                    className="flex-1 text-left bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-ui text-sm text-stone-300">{s.participantName}</p>
                        <p className="font-ui text-[11px] text-stone-500 mt-0.5">
                          {s.participantRole}{s.organization ? ` · ${s.organization}` : ''} ·{' '}
                          {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="font-ui text-[10px] text-stone-500 tracking-wider uppercase">View</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.participantName)}
                    className="shrink-0 w-9 h-9 rounded-lg border border-white/[0.06] text-stone-600 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
