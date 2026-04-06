import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showConcepts } from '../data/showConcepts';
import { conceptMedia as staticMedia } from '../data/conceptMedia';
import { fetchSession, updateSession, fetchConceptMedia } from '../lib/api';

interface ConceptReaction {
  rating: number;
  notes: string;
  wouldWatch: boolean;
}

interface ConceptMedia {
  storyboard: string[];
  mood: string[];
  videoUrl: string;
}

interface Session {
  id: string;
  participantName: string;
  conceptReactions: Record<string, ConceptReaction>;
  [key: string]: any;
}

function VideoEmbed({ url }: { url: string }) {
  if (!url) return null;
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return (
    <div className="video-container border border-white/10 rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function Concepts() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [media, setMedia] = useState<Record<string, ConceptMedia>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, ConceptReaction>>({});
  const [showPanel, setShowPanel] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const storyboardInputRef = useRef<HTMLInputElement>(null);
  const moodInputRef = useRef<HTMLInputElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) {
      fetchSession(id).then(s => {
        if (s) {
          setSession(s);
          setReactions(s.conceptReactions || {});
        } else {
          setSession({ id: 'presentation', participantName: '', conceptReactions: {} });
        }
      });
    } else {
      setSession({ id: 'presentation', participantName: '', conceptReactions: {} });
    }
    fetchConceptMedia().then(setMedia).catch(() => setMedia(staticMedia));
  }, [id, navigate]);

  const concept = showConcepts[activeIndex];
  const cm = media[concept.id] || { storyboard: [], mood: [], videoUrl: '' };

  useEffect(() => {
    setVideoInput(cm.videoUrl || '');
    setShowPanel(false);
    setExpandedSection(null);
  }, [activeIndex]);

  const getReaction = (conceptId: string): ConceptReaction => {
    return reactions[conceptId] || { rating: 0, notes: '', wouldWatch: false };
  };

  const updateReaction = (conceptId: string, updates: Partial<ConceptReaction>) => {
    const updated = { ...reactions, [conceptId]: { ...getReaction(conceptId), ...updates } };
    setReactions(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!session || !id) return;
      updateSession(id, { ...session, conceptReactions: updated }).then(setSession).catch(() => {});
    }, 800);
  };

  const saveVideoUrl = async () => {
    const res = await fetch(`/api/concept-media/${concept.id}/video`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: videoInput }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(prev => ({ ...prev, [concept.id]: updated }));
    }
  };

  const uploadImage = async (file: File, category: 'storyboard' | 'mood') => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`/api/concept-media/${concept.id}/image?category=${category}`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(prev => ({ ...prev, [concept.id]: updated }));
    }
  };

  const deleteImage = async (imagePath: string) => {
    const res = await fetch(`/api/concept-media/${concept.id}/image`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(prev => ({ ...prev, [concept.id]: updated }));
    }
  };

  if (!session) return null;

  const reaction = getReaction(concept.id);
  const allImages = [...(cm.storyboard || []), ...(cm.mood || [])];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-[80px]">
      {/* ── Hero: full-bleed image + title overlay ── */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background image mosaic */}
        {allImages.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-3 gap-0">
            {allImages.slice(0, 3).map((src, i) => (
              <div key={i} className="overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/40" />

        {/* Concept tabs at top */}
        <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-6">
          <div className="flex gap-2 justify-center items-center">
            {showConcepts.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setActiveIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`px-5 py-2 rounded-full text-xs font-ui tracking-wider whitespace-nowrap transition-all ${
                  i === activeIndex
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-black/40 backdrop-blur-sm text-white/70 hover:text-white border border-white/20'
                }`}
              >
                {c.title}
              </button>
            ))}
            <span className="w-[1px] h-5 bg-white/20 mx-2" />
            <button
              onClick={() => navigate('/brainstorm')}
              className="px-5 py-2 rounded-full text-xs font-ui tracking-wider whitespace-nowrap transition-all bg-black/40 backdrop-blur-sm text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
            >
              Brainstorm
            </button>
          </div>
        </div>

        {/* Title content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-12">
          <div className="max-w-4xl mx-auto">
            <span className="font-ui text-[11px] text-amber-500/70 tracking-widest">{concept.number}</span>
            <h1 className="font-display text-[56px] md:text-[72px] lg:text-[88px] text-white leading-[0.95] tracking-tight mt-2">
              {concept.title}
            </h1>
            {concept.tagline && (
              <p className="font-body text-xl text-stone-300 mt-4 max-w-lg">{concept.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 md:px-12 lg:px-20 pt-12">
        <div className="max-w-4xl mx-auto">

          {/* Video embed if exists */}
          {cm.videoUrl && (
            <div className="mb-12">
              <VideoEmbed url={cm.videoUrl} />
            </div>
          )}

          {/* Logline as big pull quote */}
          <p className="font-display text-[24px] md:text-[32px] text-white leading-[1.4] tracking-tight mb-12">
            {concept.logline}
          </p>

          {/* Format: "Love Island meets Survivor" style quick reference */}
          <div className="flex gap-3 mb-12">
            {concept.mechanics.map((mech, i) => (
              <button
                key={i}
                onClick={() => setExpandedSection(expandedSection === mech.title ? null : mech.title)}
                className={`px-4 py-2 rounded-full text-xs font-ui tracking-wider transition-all ${
                  expandedSection === mech.title
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {mech.title}
              </button>
            ))}
          </div>

          {/* Expanded mechanic */}
          {expandedSection && (
            <div className="mb-12 bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-5">
              <p className="font-body text-[15px] text-stone-300 leading-[1.9]">
                {concept.mechanics.find(m => m.title === expandedSection)?.body}
              </p>
            </div>
          )}

          {/* The story - collapsible */}
          <div className="mb-12">
            <button
              onClick={() => setExpandedSection(expandedSection === 'story' ? null : 'story')}
              className="flex items-center gap-3 group"
            >
              <span className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 group-hover:text-amber-400 transition-colors">
                The story
              </span>
              <span className="text-stone-600 text-xs">{expandedSection === 'story' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'story' && (
              <div className="mt-6 space-y-6 max-w-2xl">
                {concept.narrative.map((para, i) => {
                  const labelMatch = para.match(/^(ACT ONE|ACT TWO|ACT THREE|THE CRITICAL DESIGN RULE):\s*/i);
                  if (labelMatch) {
                    return (
                      <p key={i} className="font-body text-[15px] text-stone-400 leading-[1.9]">
                        <span className="font-ui text-amber-400 font-semibold tracking-wider uppercase text-[12px]">{labelMatch[1]}:</span>{' '}
                        {para.slice(labelMatch[0].length)}
                      </p>
                    );
                  }
                  return <p key={i} className="font-body text-[15px] text-stone-400 leading-[1.9]">{para}</p>;
                })}
              </div>
            )}
          </div>

          {/* Cast - horizontal scroll cards */}
          <div className="mb-12">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-4">
              Who's in it
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
              {concept.castExamples.map((cast, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[280px] bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 snap-start"
                >
                  <p className="font-ui text-[13px] text-white font-medium mb-2">{cast.label}</p>
                  <p className="font-body text-[12px] text-stone-500 leading-relaxed">{cast.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom images grid */}
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
          <div className="mb-12 py-8 border-t border-white/[0.06]">
            <p className="font-display text-xl md:text-2xl text-stone-300 leading-snug tracking-tight italic max-w-2xl">
              "{concept.closingQuote}"
            </p>
          </div>

          {/* Discussion questions - compact */}
          <div className="mb-12">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-3">
              Discussion
            </p>
            <div className="flex flex-wrap gap-2">
              {concept.discussionQuestions.map((q, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full font-body text-[12px] text-stone-400"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#111]/95 border-t border-white/[0.08] backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => updateReaction(concept.id, { rating: n })}
                    className={`w-7 h-7 rounded-md font-ui text-[11px] transition-all ${
                      reaction.rating === n
                        ? 'bg-amber-500 text-black font-bold'
                        : reaction.rating >= n
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-white/5 text-stone-500 hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={() => updateReaction(concept.id, { wouldWatch: !reaction.wouldWatch })}
                className={`px-2.5 py-1 rounded-full text-[10px] font-ui tracking-wider transition-all ${
                  reaction.wouldWatch
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-stone-500 border border-white/10 hover:text-stone-300'
                }`}
              >
                {reaction.wouldWatch ? '\u2713 Watch' : 'Watch?'}
              </button>

              <button
                onClick={() => setShowPanel(!showPanel)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-ui tracking-wider transition-all ${
                  showPanel
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-stone-500 border border-white/10 hover:text-stone-300'
                }`}
              >
                {showPanel ? '\u25BE Panel' : '\u25B8 Notes'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeIndex > 0) {
                    setActiveIndex(activeIndex - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (id) {
                    navigate(`/interview/${id}/notes`);
                  }
                }}
                className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors px-2"
              >
                \u2190
              </button>
              {activeIndex < showConcepts.length - 1 && (
                <button
                  onClick={() => {
                    setActiveIndex(activeIndex + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-1.5 bg-amber-500 text-black font-ui text-[10px] tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
                >
                  Next \u2192
                </button>
              )}
              {activeIndex === showConcepts.length - 1 && id && (
                <button
                  onClick={() => navigate(`/interview/${id}/ideas`)}
                  className="px-4 py-1.5 bg-amber-500 text-black font-ui text-[10px] tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
                >
                  Ideas \u2192
                </button>
              )}
            </div>
          </div>

          {/* Expanded panel */}
          {showPanel && (
            <div className="pb-5 pt-2 border-t border-white/[0.06] max-h-[50vh] overflow-y-auto space-y-4">
              <div>
                <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Reaction notes</p>
                <textarea
                  value={reaction.notes}
                  onChange={(e) => updateReaction(concept.id, { notes: e.target.value })}
                  className="w-full min-h-[60px] text-[13px] text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2 resize-y focus:outline-none focus:border-amber-500/30 font-body leading-[1.8] placeholder:text-stone-600"
                  placeholder="Quotes, reactions, body language..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Video</p>
                  <div className="flex gap-2">
                    <input
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      className="flex-1 text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/30 font-ui"
                      placeholder="YouTube or Vimeo"
                    />
                    <button
                      onClick={saveVideoUrl}
                      className="px-3 py-1.5 bg-white/10 text-stone-300 font-ui text-[10px] tracking-wider uppercase rounded-lg hover:bg-white/20"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Storyboard</p>
                    <div className="flex flex-wrap gap-1">
                      {(cm.storyboard || []).map((img, i) => (
                        <div key={i} className="relative group w-12 h-12 rounded overflow-hidden border border-white/10">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => deleteImage(img)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <span className="text-red-400 text-[10px]">\u2715</span>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => storyboardInputRef.current?.click()}
                        className="w-12 h-12 rounded border border-dashed border-white/10 flex items-center justify-center text-stone-600 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                      >+</button>
                      <input ref={storyboardInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => { Array.from(e.target.files || []).forEach(f => uploadImage(f, 'storyboard')); e.target.value = ''; }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Mood</p>
                    <div className="flex flex-wrap gap-1">
                      {(cm.mood || []).map((img, i) => (
                        <div key={i} className="relative group w-12 h-12 rounded overflow-hidden border border-white/10">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => deleteImage(img)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <span className="text-red-400 text-[10px]">\u2715</span>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => moodInputRef.current?.click()}
                        className="w-12 h-12 rounded border border-dashed border-white/10 flex items-center justify-center text-stone-600 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                      >+</button>
                      <input ref={moodInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => { Array.from(e.target.files || []).forEach(f => uploadImage(f, 'mood')); e.target.value = ''; }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
