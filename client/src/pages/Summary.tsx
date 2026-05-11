import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showConcepts } from '../data/showConcepts';
import { fetchSession } from '../lib/api';

interface Session {
  id: string;
  participantName: string;
  participantRole: string;
  organization: string;
  context: string;
  startTime: string;
  endTime: string | null;
  openingNotes: string;
  closingNotes: string;
  conceptReactions: Record<string, { rating: number; notes: string; wouldWatch: boolean }>;
  ideaCards: { id: string; title: string; notes: string; tags: string[] }[];
}

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchSession(id).then(s => {
      if (!s) { navigate('/'); return; }
      setSession(s);
    });
  }, [id, navigate]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/')}
            className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors"
          >
            ← All Interviews
          </button>
          <button
            onClick={() => navigate('/synthesis')}
            className="font-ui text-[10px] text-stone-400 tracking-widest uppercase hover:text-amber-400 transition-colors px-4 py-2 border border-white/10 rounded-full hover:border-amber-500/30"
          >
            Synthesis
          </button>
        </div>

        {/* Participant info */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight tracking-tight mb-2">
            {session.participantName}
          </h1>
          <p className="font-ui text-sm text-stone-400">
            {session.participantRole}{session.organization ? ` · ${session.organization}` : ''}
          </p>
          <p className="font-ui text-xs text-stone-500 mt-1">
            {new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {session.endTime && ` · ${Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} min`}
          </p>
          {session.context && (
            <p className="font-body text-sm text-stone-500 mt-3 italic">{session.context}</p>
          )}
        </div>

        {/* Opening Notes */}
        {session.openingNotes && (
          <div className="mb-12">
            <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-4">Interview Notes</p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <p className="font-body text-[15px] text-stone-300 leading-[1.9] whitespace-pre-wrap">
                {session.openingNotes}
              </p>
            </div>
          </div>
        )}

        {/* Concept Reactions */}
        {Object.keys(session.conceptReactions || {}).length > 0 && (
          <div className="mb-12">
            <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-4">Concept Reactions</p>
            <div className="space-y-4">
              {showConcepts.map(concept => {
                const reaction = session.conceptReactions[concept.id];
                if (!reaction) return null;
                return (
                  <div key={concept.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-ui text-[11px] text-amber-500/60 tracking-widest">{concept.number}</span>
                        <h3 className="font-display text-lg text-white tracking-tight">{concept.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        {reaction.wouldWatch && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-ui tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                            Would watch
                          </span>
                        )}
                        {reaction.rating > 0 && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <span
                                key={n}
                                className={`w-6 h-6 rounded text-center text-[11px] leading-6 font-ui ${
                                  n <= reaction.rating ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-stone-600'
                                }`}
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {reaction.notes && (
                      <p className="font-body text-[14px] text-stone-400 leading-[1.85] whitespace-pre-wrap">
                        {reaction.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Idea Cards */}
        {session.ideaCards?.length > 0 && (
          <div className="mb-12">
            <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-4">
              Ideas Captured ({session.ideaCards.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.ideaCards.map(card => (
                <div key={card.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <p className="font-display text-base text-white leading-tight tracking-tight mb-2">
                    {card.title || 'Untitled'}
                  </p>
                  {card.notes && (
                    <p className="font-body text-xs text-stone-400 leading-relaxed mb-2">{card.notes}</p>
                  )}
                  {card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-ui tracking-wider bg-amber-500/10 text-amber-400/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing Notes */}
        {session.closingNotes && (
          <div className="mb-12">
            <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-4">Closing Notes</p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <p className="font-body text-[15px] text-stone-300 leading-[1.9] whitespace-pre-wrap">
                {session.closingNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
