import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface IdeaCard {
  id: string;
  title: string;
  notes: string;
  tags: string[];
}

interface Session {
  id: string;
  participantName: string;
  ideaCards: IdeaCard[];
  [key: string]: any;
}

const TAG_OPTIONS = [
  'show format', 'casting', 'location', 'narrative device', 'funding model',
  'audience hook', 'climate angle', 'distribution', 'community', 'twist',
];

export default function Ideas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [cards, setCards] = useState<IdeaCard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(s => {
      setSession(s);
      setCards(s.ideaCards || []);
    }).catch(() => navigate('/'));
  }, [id, navigate]);

  const save = (updatedCards: IdeaCard[]) => {
    setCards(updatedCards);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!session) return;
      fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, ideaCards: updatedCards }),
      }).then(r => r.json()).then(setSession).catch(() => {});
    }, 800);
  };

  const addCard = () => {
    const newCard: IdeaCard = {
      id: `idea-${Date.now()}`,
      title: '',
      notes: '',
      tags: [],
    };
    const updated = [...cards, newCard];
    save(updated);
    setEditingId(newCard.id);
  };

  const updateCard = (cardId: string, updates: Partial<IdeaCard>) => {
    const updated = cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
    save(updated);
  };

  const removeCard = (cardId: string) => {
    const updated = cards.filter(c => c.id !== cardId);
    save(updated);
    if (editingId === cardId) setEditingId(null);
  };

  const toggleTag = (cardId: string, tag: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const tags = card.tags.includes(tag) ? card.tags.filter(t => t !== tag) : [...card.tags, tag];
    updateCard(cardId, { tags });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/interview/${id}/concepts`)}
            className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors"
          >
            ← Concepts
          </button>
          <div className="flex items-center gap-2">
            <span className="font-ui text-[10px] text-stone-500 tracking-wider">
              {session.participantName}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="mb-12">
          <p className="font-ui text-[10px] text-amber-500/50 tracking-[0.25em] uppercase mb-3">Quick Capture</p>
          <h1 className="font-display text-3xl md:text-4xl text-white leading-tight tracking-tight mb-3">
            Their Ideas
          </h1>
          <p className="font-body text-[15px] text-stone-400 leading-relaxed max-w-xl">
            Capture every idea they throw out. One card per idea. Short titles, raw notes. You can tag and organize later.
          </p>
        </div>

        {/* Idea Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${
                editingId === card.id ? 'border-amber-500/40' : 'border-white/[0.06]'
              }`}
            >
              {editingId === card.id ? (
                /* Editing mode */
                <div className="space-y-3">
                  <input
                    value={card.title}
                    onChange={(e) => updateCard(card.id, { title: e.target.value })}
                    className="w-full text-lg text-white bg-transparent border-none outline-none font-display tracking-tight placeholder:text-stone-600"
                    placeholder="Idea title..."
                    autoFocus
                  />
                  <textarea
                    value={card.notes}
                    onChange={(e) => updateCard(card.id, { notes: e.target.value })}
                    className="w-full min-h-[100px] text-[13px] text-stone-300 bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:border-amber-500/30 font-body leading-[1.8] placeholder:text-stone-600"
                    placeholder="Raw notes, quotes, half-formed thoughts..."
                  />
                  <div>
                    <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TAG_OPTIONS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(card.id, tag)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-ui tracking-wider transition-all ${
                            card.tags.includes(tag)
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-white/5 text-stone-500 border border-white/10 hover:text-stone-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[10px] font-ui tracking-wider uppercase text-amber-400 hover:text-amber-300"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="text-[10px] font-ui tracking-wider uppercase text-stone-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <button
                  onClick={() => setEditingId(card.id)}
                  className="w-full text-left"
                >
                  <p className="font-display text-lg text-white leading-tight tracking-tight mb-2">
                    {card.title || <span className="text-stone-600 italic">Untitled idea</span>}
                  </p>
                  {card.notes && (
                    <p className="font-body text-xs text-stone-400 leading-relaxed line-clamp-3 mb-3">
                      {card.notes}
                    </p>
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
                </button>
              )}
            </div>
          ))}

          {/* Add card button */}
          <button
            onClick={addCard}
            className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group min-h-[140px] flex flex-col items-center justify-center"
          >
            <span className="font-display text-2xl text-stone-500 group-hover:text-amber-400 transition-colors mb-1">+</span>
            <span className="font-ui text-[10px] text-stone-500 tracking-wider uppercase">New idea</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-white/[0.06]">
          <button
            onClick={() => navigate(`/interview/${id}/concepts`)}
            className="font-ui text-[10px] text-stone-400 tracking-wider uppercase hover:text-white transition-colors"
          >
            ← Back to Concepts
          </button>
          <button
            onClick={() => navigate(`/interview/${id}/end`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black font-ui text-xs tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
          >
            Wrap Up
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
