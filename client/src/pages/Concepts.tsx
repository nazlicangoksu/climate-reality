import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showConcepts } from '../data/showConcepts';

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

// ── Moodboard Grid ──────────────────────────────────────────────────────────
// Clean 2-row grid, all black & white, conveying vibe not the thing

function MoodboardCollage({ storyboard, mood }: { storyboard: string[]; mood: string[] }) {
  const allImages = [...storyboard, ...mood];
  if (allImages.length === 0) return null;

  // Images that need bottom-anchoring (subject/title at bottom of photo)
  const bottomAnchored = ['TAR36poster', 'billy-kCJcbl2Go30'];
  const getPosition = (src: string) =>
    bottomAnchored.some(id => src.includes(id)) ? 'object-bottom' : 'object-center';

  // Fill 2 rows: top row gets ceil(n/2), bottom gets the rest
  const topCount = Math.ceil(allImages.length / 2);
  const topRow = allImages.slice(0, topCount);
  const bottomRow = allImages.slice(topCount);

  return (
    <div className="space-y-1.5 grayscale opacity-90">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${topRow.length}, 1fr)` }}>
        {topRow.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-white/[0.06]" style={{ height: '200px' }}>
            <img src={src} alt="" className={`w-full h-full object-cover ${getPosition(src)}`} />
          </div>
        ))}
      </div>
      {bottomRow.length > 0 && (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${bottomRow.length}, 1fr)` }}>
          {bottomRow.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-white/[0.06]" style={{ height: '200px' }}>
              <img src={src} alt="" className={`w-full h-full object-cover ${getPosition(src)}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Concepts() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [media, setMedia] = useState<Record<string, ConceptMedia>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, ConceptReaction>>({});
  const [showPanel, setShowPanel] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'storyboard' | 'mood'>('storyboard');
  const storyboardInputRef = useRef<HTMLInputElement>(null);
  const moodInputRef = useRef<HTMLInputElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(s => {
      setSession(s);
      setReactions(s.conceptReactions || {});
    }).catch(() => navigate('/'));
    fetch('/api/concept-media').then(r => r.json()).then(setMedia).catch(() => {});
  }, [id, navigate]);

  const concept = showConcepts[activeIndex];
  const cm = media[concept.id] || { storyboard: [], mood: [], videoUrl: '' };

  useEffect(() => {
    setVideoInput(cm.videoUrl || '');
    setShowPanel(false);
  }, [activeIndex]);

  const getReaction = (conceptId: string): ConceptReaction => {
    return reactions[conceptId] || { rating: 0, notes: '', wouldWatch: false };
  };

  const updateReaction = (conceptId: string, updates: Partial<ConceptReaction>) => {
    const updated = { ...reactions, [conceptId]: { ...getReaction(conceptId), ...updates } };
    setReactions(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (!session) return;
      fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, conceptReactions: updated }),
      }).then(r => r.json()).then(setSession).catch(() => {});
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
  const hasVisuals = cm.storyboard.length > 0 || cm.mood.length > 0 || cm.videoUrl;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-[140px]">
      {/* ── Interviewee-facing presentation ──────────────────────────────── */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Concept tabs */}
          <div className="flex gap-2 mb-16 overflow-x-auto pb-2 justify-center">
            {showConcepts.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setActiveIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`px-5 py-2 rounded-full text-xs font-ui tracking-wider whitespace-nowrap transition-all ${
                  i === activeIndex
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <span className="font-ui text-[11px] text-amber-500/50 tracking-widest">{concept.number}</span>
            <h2 className="font-display text-[48px] md:text-[64px] lg:text-[72px] text-white leading-[1.02] tracking-tight mt-4 mb-6">
              {concept.title}
            </h2>
            <p className="font-body text-lg md:text-xl text-stone-400 italic max-w-xl mx-auto">
              {concept.tagline}
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-[1px] bg-amber-500/30 mx-auto mb-16" />

          {/* Video embed if exists */}
          {cm.videoUrl && (
            <div className="max-w-4xl mx-auto mb-16">
              <VideoEmbed url={cm.videoUrl} />
            </div>
          )}

          {/* ── Editorial layout: logline as pull quote ────────────────── */}
          <div className="max-w-2xl mx-auto mb-20">
            <p className="font-display text-[22px] md:text-[28px] text-stone-200 leading-[1.5] tracking-tight">
              {concept.logline}
            </p>
          </div>

          {/* Narrative paragraphs with generous spacing */}
          <div className="max-w-2xl mx-auto space-y-8 mb-20">
            {concept.narrative.map((para, i) => {
              const labelMatch = para.match(/^(ACT ONE|ACT TWO|ACT THREE|THE CRITICAL DESIGN RULE):\s*/i);
              if (labelMatch) {
                return (
                  <p key={i} className="font-body text-[16px] text-stone-400 leading-[2]">
                    <span className="font-ui text-amber-400 font-semibold tracking-wider uppercase text-[13px]">{labelMatch[1]}:</span>{' '}
                    {para.slice(labelMatch[0].length)}
                  </p>
                );
              }
              return <p key={i} className="font-body text-[16px] text-stone-400 leading-[2]">{para}</p>;
            })}
          </div>

          {/* Cast -- horizontal cards */}
          <div className="max-w-3xl mx-auto mb-20">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-600 mb-6">
              Who's in it
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {concept.castExamples.map((cast, i) => (
                <div key={i} className="border-t border-white/[0.08] pt-4">
                  <p className="font-ui text-[13px] text-white font-medium mb-1.5">{cast.label}</p>
                  <p className="font-body text-[13px] text-stone-500 leading-relaxed">{cast.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mechanics -- cleaner editorial style */}
          <div className="max-w-2xl mx-auto mb-20">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-600 mb-6">
              How it works
            </p>
            <div className="space-y-8">
              {concept.mechanics.map((mech, i) => (
                <div key={i}>
                  <p className="font-ui text-[13px] text-amber-400/60 tracking-wider uppercase mb-2">{mech.title}</p>
                  <p className="font-body text-[15px] text-stone-400 leading-[2]">{mech.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── "It might feel like this..." + Moodboard ──────────────── */}
          {(cm.storyboard.length > 0 || cm.mood.length > 0) && (
            <div className="max-w-4xl mx-auto mb-20">
              <p className="font-display text-[18px] md:text-[22px] text-stone-500 italic tracking-tight mb-8 text-center">
                It might feel like this...
              </p>
              <MoodboardCollage storyboard={cm.storyboard || []} mood={cm.mood || []} />
            </div>
          )}

          {/* Closing quote */}
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <div className="w-8 h-[1px] bg-white/10 mx-auto mb-10" />
            <p className="font-display text-xl md:text-2xl text-stone-300 leading-snug tracking-tight italic">
              "{concept.closingQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* ── Interviewer Panel (sticky bottom) ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#111]/95 border-t border-white/[0.08] backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Collapsed bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {/* Quick rating */}
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
                {reaction.wouldWatch ? '✓ Watch' : 'Watch?'}
              </button>

              <button
                onClick={() => setShowPanel(!showPanel)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-ui tracking-wider transition-all ${
                  showPanel
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-stone-500 border border-white/10 hover:text-stone-300'
                }`}
              >
                {showPanel ? '▾ Panel' : '▸ Notes & Media'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeIndex > 0) {
                    setActiveIndex(activeIndex - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate(`/interview/${id}/notes`);
                  }
                }}
                className="font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-white transition-colors px-2"
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (activeIndex < showConcepts.length - 1) {
                    setActiveIndex(activeIndex + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate(`/interview/${id}/ideas`);
                  }
                }}
                className="px-4 py-1.5 bg-amber-500 text-black font-ui text-[10px] tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
              >
                {activeIndex < showConcepts.length - 1 ? 'Next →' : 'Ideas →'}
              </button>
            </div>
          </div>

          {/* Expanded panel */}
          {showPanel && (
            <div className="pb-5 pt-2 border-t border-white/[0.06] max-h-[50vh] overflow-y-auto space-y-4">
              {/* Reaction notes */}
              <div>
                <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Reaction notes</p>
                <textarea
                  value={reaction.notes}
                  onChange={(e) => updateReaction(concept.id, { notes: e.target.value })}
                  className="w-full min-h-[60px] text-[13px] text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2 resize-y focus:outline-none focus:border-amber-500/30 font-body leading-[1.8] placeholder:text-stone-600"
                  placeholder="Quotes, reactions, body language..."
                />
              </div>

              {/* Two-column: video + images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video */}
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

                {/* Discussion prompts */}
                <div>
                  <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">Ask them</p>
                  {concept.discussionQuestions.map((q, i) => (
                    <p key={i} className="font-body text-[11px] text-stone-500 leading-relaxed">· {q}</p>
                  ))}
                </div>
              </div>

              {/* Image uploads by category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Storyboard images */}
                <div>
                  <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">
                    Storyboard <span className="text-stone-600">(reference shots, similar shows)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(cm.storyboard || []).map((img, i) => (
                      <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => deleteImage(img)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span className="text-red-400 text-[10px]">✕</span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => storyboardInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-stone-600 hover:border-amber-500/30 hover:text-amber-400 transition-all text-lg"
                    >
                      +
                    </button>
                    <input
                      ref={storyboardInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(f => uploadImage(f, 'storyboard'));
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>

                {/* Mood / texture images */}
                <div>
                  <p className="font-ui text-[10px] text-stone-500 tracking-wider uppercase mb-1.5">
                    Mood & Texture <span className="text-stone-600">(vibes, colors, feeling)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(cm.mood || []).map((img, i) => (
                      <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => deleteImage(img)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span className="text-red-400 text-[10px]">✕</span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => moodInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-stone-600 hover:border-amber-500/30 hover:text-amber-400 transition-all text-lg"
                    >
                      +
                    </button>
                    <input
                      ref={moodInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(f => uploadImage(f, 'mood'));
                        e.target.value = '';
                      }}
                    />
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
