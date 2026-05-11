import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showConcepts } from '../data/showConcepts';
import { fetchSynthesis } from '../lib/api';

interface ConceptSummary {
  conceptId: string;
  avgRating: number;
  wouldWatchPct: number;
  totalReviewed: number;
  allNotes: string[];
}

interface IdeaEntry {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  sessionId: string;
  participantName: string;
  participantRole: string;
  organization: string;
}

interface NoteEntry {
  sessionId: string;
  participantName: string;
  participantRole: string;
  organization: string;
  date: string;
  openingNotes: string;
  closingNotes: string;
}

interface SynthesisData {
  totalSessions: number;
  completedSessions: number;
  conceptSummaries: ConceptSummary[];
  allIdeas: IdeaEntry[];
  allNotes: NoteEntry[];
}

export default function Synthesis() {
  const navigate = useNavigate();
  const [data, setData] = useState<SynthesisData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'concepts' | 'ideas' | 'notes'>('overview');

  useEffect(() => {
    fetchSynthesis().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="font-ui text-sm text-stone-500">Loading synthesis...</p>
      </div>
    );
  }

  // Tag frequency across all ideas
  const tagCounts: Record<string, number> = {};
  for (const idea of data.allIdeas) {
    for (const tag of idea.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <button
              onClick={() => navigate('/')}
              className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors mb-6 block"
            >
              ← Interviews
            </button>
            <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-3">
              Across All Interviews
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white leading-tight tracking-tight">
              Synthesis
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl text-white">{data.completedSessions}</p>
            <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mt-1">Interviews</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl text-white">{data.allIdeas.length}</p>
            <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mt-1">Ideas Captured</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl text-white">{data.conceptSummaries.length}</p>
            <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mt-1">Concepts Tested</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl text-white">{sortedTags.length}</p>
            <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mt-1">Themes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {(['overview', 'concepts', 'ideas', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-ui tracking-wider capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Concept rankings */}
            <div>
              <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-6">Concept Performance</p>
              <div className="space-y-4">
                {showConcepts.map(concept => {
                  const summary = data.conceptSummaries.find(s => s.conceptId === concept.id);
                  return (
                    <div key={concept.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-ui text-[11px] text-amber-500/60 tracking-widest">{concept.number}</span>
                          <h3 className="font-display text-xl text-white tracking-tight">{concept.title}</h3>
                        </div>
                        {summary && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-display text-2xl text-amber-400">{summary.avgRating || '—'}</p>
                              <p className="font-ui text-[9px] text-stone-500 tracking-wider uppercase">Avg Rating</p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-2xl text-white">{summary.wouldWatchPct}%</p>
                              <p className="font-ui text-[9px] text-stone-500 tracking-wider uppercase">Would Watch</p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-2xl text-stone-400">{summary.totalReviewed}</p>
                              <p className="font-ui text-[9px] text-stone-500 tracking-wider uppercase">Reviewed</p>
                            </div>
                          </div>
                        )}
                        {!summary && (
                          <p className="font-ui text-xs text-stone-500 italic">No reviews yet</p>
                        )}
                      </div>
                      {/* Rating bar */}
                      {summary && summary.avgRating > 0 && (
                        <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
                          <div
                            className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${(summary.avgRating / 5) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top themes */}
            {sortedTags.length > 0 && (
              <div>
                <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-6">Emerging Themes</p>
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-ui tracking-wider bg-white/[0.03] border border-white/[0.06] text-stone-300"
                    >
                      {tag} <span className="text-amber-400/60 ml-1">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Concepts Tab ─────────────────────────────────────────────── */}
        {activeTab === 'concepts' && (
          <div className="space-y-8">
            {showConcepts.map(concept => {
              const summary = data.conceptSummaries.find(s => s.conceptId === concept.id);
              return (
                <div key={concept.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-ui text-[11px] text-amber-500/60 tracking-widest">{concept.number}</span>
                    <h3 className="font-display text-2xl text-white tracking-tight">{concept.title}</h3>
                  </div>
                  {summary && summary.allNotes.length > 0 ? (
                    <div className="space-y-3">
                      {summary.allNotes.map((note, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                          <p className="font-body text-[14px] text-stone-300 leading-[1.85] whitespace-pre-wrap">{note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-sm text-stone-500 italic">No reaction notes yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Ideas Tab ────────────────────────────────────────────────── */}
        {activeTab === 'ideas' && (
          <div>
            {data.allIdeas.length === 0 ? (
              <p className="font-body text-sm text-stone-500 italic py-12 text-center">No ideas captured yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.allIdeas.map(idea => (
                  <div key={idea.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <p className="font-display text-lg text-white leading-tight tracking-tight mb-2">
                      {idea.title || 'Untitled'}
                    </p>
                    {idea.notes && (
                      <p className="font-body text-xs text-stone-400 leading-relaxed mb-3">{idea.notes}</p>
                    )}
                    {idea.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {idea.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-ui tracking-wider bg-amber-500/10 text-amber-400/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="font-ui text-[10px] text-stone-500">
                      {idea.participantName}{idea.participantRole ? ` · ${idea.participantRole}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Notes Tab ────────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div className="space-y-8">
            {data.allNotes.length === 0 ? (
              <p className="font-body text-sm text-stone-500 italic py-12 text-center">No interview notes yet.</p>
            ) : (
              data.allNotes.map(entry => (
                <div key={entry.sessionId} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-ui text-sm text-white">{entry.participantName}</p>
                      <p className="font-ui text-[11px] text-stone-500">
                        {entry.participantRole}{entry.organization ? ` · ${entry.organization}` : ''} ·{' '}
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/interview/${entry.sessionId}/summary`)}
                      className="font-ui text-[10px] text-stone-400 tracking-wider uppercase hover:text-amber-400 transition-colors"
                    >
                      Full summary →
                    </button>
                  </div>
                  {entry.openingNotes && (
                    <div className="mb-4">
                      <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-2">Interview Notes</p>
                      <p className="font-body text-[13px] text-stone-400 leading-[1.85] whitespace-pre-wrap line-clamp-6">
                        {entry.openingNotes}
                      </p>
                    </div>
                  )}
                  {entry.closingNotes && (
                    <div>
                      <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-2">Closing Notes</p>
                      <p className="font-body text-[13px] text-stone-400 leading-[1.85] whitespace-pre-wrap line-clamp-6">
                        {entry.closingNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
