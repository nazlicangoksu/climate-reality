import { useState, useEffect, useCallback } from 'react';
import { useInView } from '../hooks/useInView';
import {
  hero,
  designPrinciples,
  showConcepts,
  brainstormPrompts,
  principlesChecklist,
  type ShowConcept,
} from '../data/showConcepts';

// ── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  sectionId: string;
  text: string;
  author: string;
  timestamp: string;
}

interface CommunityIdea {
  id: string;
  title: string;
  tagline: string;
  hook: string;
  world: string;
  cast: string;
  onRamp: string;
  author: string;
  videoUrl: string;
  timestamp: string;
  reactions: Record<string, number>;
}

interface BrainstormEntry {
  id: string;
  section: string;
  questionLabel: string;
  response: string;
  author: string;
  timestamp: string;
}

type ReactionsMap = Record<string, Record<string, number>>;

// ── Nav chapters ─────────────────────────────────────────────────────────────

const chapters = [
  { id: 'principles', nav: 'Principles' },
  { id: 'concepts', nav: 'Concepts' },
  { id: 'brainstorm', nav: 'Brainstorm' },
  { id: 'community', nav: 'Community' },
];

// ── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-white/5">
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Sticky Nav ───────────────────────────────────────────────────────────────

function StickyNav() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.8);
      for (const ch of [...chapters].reverse()) {
        const el = document.getElementById(ch.id);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActive(ch.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <nav className="fixed top-4 left-0 w-full z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-black/80 backdrop-blur-md rounded-full border border-white/10 px-2 py-1.5 flex items-center gap-1 shadow-2xl font-ui">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`px-3.5 py-1.5 text-[9px] tracking-widest uppercase transition-all whitespace-nowrap rounded-full ${
              active === ch.id
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-stone-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {ch.nav}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Reaction Chips ───────────────────────────────────────────────────────────

function ReactionChips({
  sectionId,
  reactions,
  onReact,
}: {
  sectionId: string;
  reactions: ReactionsMap;
  onReact: (sectionId: string, reaction: string) => void;
}) {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const sectionReactions = reactions[sectionId] || {};

  const chips = [
    { key: 'would-watch', label: "I'd watch this", icon: '📺' },
    { key: 'interesting', label: 'Interesting', icon: '✦' },
    { key: 'pushback', label: 'Pushback', icon: '↔' },
  ];

  const handleReact = (key: string) => {
    if (voted.has(key)) return;
    setVoted((prev) => new Set(prev).add(key));
    onReact(sectionId, key);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-8">
      {chips.map((chip) => {
        const count = sectionReactions[chip.key] || 0;
        const isActive = voted.has(chip.key);
        return (
          <button
            key={chip.key}
            onClick={() => handleReact(chip.key)}
            className={`chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-ui tracking-wider transition-all ${
              isActive
                ? 'bg-amber-500 text-black'
                : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <span className="text-[10px]">{chip.icon}</span>
            <span>{chip.label}</span>
            {count > 0 && (
              <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-stone-500'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Comment Thread ───────────────────────────────────────────────────────────

function CommentThread({
  sectionId,
  questions,
  onSubmit,
}: {
  sectionId: string;
  questions: Question[];
  onSubmit: (sectionId: string, text: string, author: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const sectionQuestions = questions.filter((q) => q.sectionId === sectionId);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(sectionId, text, author);
    setText('');
    setAuthor('');
    setOpen(false);
  };

  return (
    <div className="mt-6">
      {sectionQuestions.length > 0 && (
        <div className="mb-4 pl-4 border-l border-white/10 space-y-3">
          {sectionQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-xs text-stone-400 leading-relaxed font-ui">{q.text}</p>
              <p className="text-[10px] text-stone-500 mt-1 font-ui">
                {q.author} · {new Date(q.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-1.5 text-stone-500 hover:text-amber-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60 group-hover:opacity-100">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-ui tracking-wider uppercase">Leave a thought</span>
        </button>
      ) : (
        <div className="space-y-2 max-w-md">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What does this make you think about?"
            className="w-full text-xs text-stone-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
            rows={3}
            autoFocus
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full text-xs text-stone-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
          />
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="text-[10px] font-ui tracking-wider uppercase text-amber-400 hover:text-amber-300 transition-colors">
              Submit
            </button>
            <button onClick={() => { setOpen(false); setText(''); setAuthor(''); }} className="text-[10px] font-ui tracking-wider uppercase text-stone-500 hover:text-stone-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Video Embed ──────────────────────────────────────────────────────────────

function VideoEmbed({ url }: { url: string }) {
  if (!url) return null;

  // Convert YouTube URLs to embed format
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return (
    <div className="video-container mt-8 border border-white/10 rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ── Show Concept Card ────────────────────────────────────────────────────────

function ShowConceptCard({
  concept,
  videos,
  reactions,
  questions,
  onReact,
  onSubmitQuestion,
}: {
  concept: ShowConcept;
  videos: Record<string, string>;
  reactions: ReactionsMap;
  questions: Question[];
  onReact: (sectionId: string, reaction: string) => void;
  onSubmitQuestion: (sectionId: string, text: string, author: string) => void;
}) {
  const { ref, isVisible } = useInView(0.08);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      ref={ref}
      id={concept.id}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {/* Concept Header */}
      <div className="relative py-16 md:py-24">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-ui text-[11px] text-amber-500/60 tracking-widest">{concept.number}</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        <h3 className="font-display text-[36px] md:text-[52px] lg:text-[60px] text-white leading-[1.05] tracking-tight mb-4 max-w-3xl">
          {concept.title}
        </h3>

        <p className="font-body text-lg md:text-xl text-stone-400 leading-relaxed mb-6 max-w-xl italic">
          {concept.tagline}
        </p>

        <div className="w-12 h-[1px] bg-amber-500/40 mb-10" />

        {/* Logline */}
        <p className="font-body text-[17px] md:text-[19px] text-stone-300 leading-[1.85] mb-10 max-w-2xl">
          {concept.logline}
        </p>

        {/* Video if available */}
        {(concept.videoUrl || videos[concept.id]) && (
          <VideoEmbed url={concept.videoUrl || videos[concept.id]} />
        )}

        {/* Narrative */}
        <div className="max-w-2xl mt-8 space-y-5">
          {concept.narrative.map((para, i) => (
            <p key={i} className="font-body text-[16px] text-stone-400 leading-[1.9]">
              {para}
            </p>
          ))}
        </div>

        {/* Cast Examples */}
        <div className="mt-12">
          <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-amber-500/50 mb-6">
            Potential Cast
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {concept.castExamples.map((cast, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <p className="font-ui text-sm text-white font-medium mb-2">{cast.label}</p>
                <p className="font-body text-xs text-stone-500 leading-relaxed">{cast.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expand for mechanics */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-10 flex items-center gap-2 text-amber-400/70 hover:text-amber-400 transition-colors group"
        >
          <span className="font-ui text-[10px] tracking-widest uppercase">
            {expanded ? 'Collapse' : 'Show mechanics & discussion'}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[5000px] opacity-100 mt-10' : 'max-h-0 opacity-0'}`}>
          {/* Mechanics */}
          <div className="space-y-8 mb-12">
            {concept.mechanics.map((mech, i) => (
              <div key={i} className="pl-5 border-l border-amber-500/20">
                <p className="font-ui text-xs text-amber-400/60 tracking-wider uppercase mb-2">{mech.title}</p>
                <p className="font-body text-[15px] text-stone-400 leading-[1.85]">{mech.body}</p>
              </div>
            ))}
          </div>

          {/* Closing quote */}
          <div className="bg-white/[0.03] rounded-2xl p-8 md:p-12 mb-10">
            <p className="font-display text-xl md:text-2xl text-stone-200 leading-snug tracking-tight italic">
              "{concept.closingQuote}"
            </p>
          </div>

          {/* Discussion questions */}
          <div className="mb-8">
            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-4">Discussion</p>
            <div className="space-y-3">
              {concept.discussionQuestions.map((q, i) => (
                <p key={i} className="font-body text-[15px] text-stone-400 leading-relaxed pl-4 border-l border-white/10">
                  {q}
                </p>
              ))}
            </div>
          </div>

          <CommentThread sectionId={concept.id} questions={questions} onSubmit={onSubmitQuestion} />
        </div>

        <ReactionChips sectionId={concept.id} reactions={reactions} onReact={onReact} />
      </div>
    </div>
  );
}

// ── Brainstorm Section ───────────────────────────────────────────────────────

function BrainstormSection({
  brainstormEntries,
  onSubmit,
}: {
  brainstormEntries: BrainstormEntry[];
  onSubmit: (section: string, questionLabel: string, response: string, author: string) => void;
}) {
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (section: string, questionLabel: string) => {
    if (!response.trim()) return;
    onSubmit(section, questionLabel, response, author);
    setResponse('');
    setAuthor('');
    setActiveQ(null);
  };

  return (
    <div className="space-y-16">
      {brainstormPrompts.map((prompt, pi) => {
        const { ref, isVisible } = useInView(0.1);
        return (
          <div
            key={pi}
            ref={ref}
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="font-ui text-[11px] text-amber-500/50 tracking-widest">
                {String(pi + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
            </div>

            <h4 className="font-display text-2xl md:text-3xl text-white leading-tight tracking-tight mb-3">
              {prompt.section}
            </h4>

            <p className="font-ui text-[11px] text-amber-400/50 tracking-wider uppercase mb-8">
              Rule: {prompt.rule}
            </p>

            <div className="space-y-4">
              {prompt.questions.map((q, qi) => {
                const qKey = `${prompt.section}-${qi}`;
                const isActive = activeQ === qKey;
                const entries = brainstormEntries.filter(
                  (e) => e.section === prompt.section && e.questionLabel === q.label
                );
                return (
                  <div key={qi} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <p className="font-body text-[15px] text-stone-300 leading-relaxed mb-1">{q.label}</p>
                    {q.hint && (
                      <p className="font-ui text-[11px] text-stone-500 leading-relaxed mb-3">{q.hint}</p>
                    )}

                    {entries.length > 0 && (
                      <div className="mt-3 mb-3 pl-4 border-l border-amber-500/20 space-y-2">
                        {entries.map((e) => (
                          <div key={e.id}>
                            <p className="text-xs text-stone-400 font-ui">{e.response}</p>
                            <p className="text-[10px] text-stone-500 font-ui mt-0.5">
                              {e.author} · {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {isActive ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Your answer..."
                          className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
                          rows={3}
                          autoFocus
                        />
                        <input
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Your name (optional)"
                          className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSubmit(prompt.section, q.label)}
                            className="text-[10px] font-ui tracking-wider uppercase text-amber-400 hover:text-amber-300"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => { setActiveQ(null); setResponse(''); setAuthor(''); }}
                            className="text-[10px] font-ui tracking-wider uppercase text-stone-500 hover:text-stone-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveQ(qKey)}
                        className="mt-2 text-[10px] font-ui tracking-wider uppercase text-stone-500 hover:text-amber-400 transition-colors"
                      >
                        + Add your answer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Principles Checklist */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-10">
        <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-amber-500/50 mb-6">
          Design Principles Check
        </p>
        <p className="font-body text-xs text-stone-500 mb-6">
          Check every box your concept can honestly claim. Fewer than four: keep going.
        </p>
        <div className="space-y-3">
          {principlesChecklist.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/50 accent-amber-500"
              />
              <span className="font-ui text-sm text-stone-400 group-hover:text-stone-300 transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Community Ideas Section ──────────────────────────────────────────────────

function CommunitySection({
  ideas,
  reactions,
  questions,
  onSubmitIdea,
  onReact,
  onSubmitQuestion,
}: {
  ideas: CommunityIdea[];
  reactions: ReactionsMap;
  questions: Question[];
  onSubmitIdea: (idea: any) => void;
  onReact: (sectionId: string, reaction: string) => void;
  onSubmitQuestion: (sectionId: string, text: string, author: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', tagline: '', hook: '', world: '', cast: '', onRamp: '', author: '', videoUrl: '',
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.tagline.trim()) return;
    onSubmitIdea(form);
    setForm({ title: '', tagline: '', hook: '', world: '', cast: '', onRamp: '', author: '', videoUrl: '' });
    setShowForm(false);
  };

  return (
    <div>
      {/* Existing ideas */}
      {ideas.length > 0 && (
        <div className="space-y-8 mb-12">
          {ideas.map((idea) => {
            const { ref, isVisible } = useInView(0.1);
            return (
              <div
                key={idea.id}
                ref={ref}
                className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-display text-xl md:text-2xl text-white leading-tight tracking-tight">
                      {idea.title}
                    </h4>
                    <p className="font-body text-sm text-stone-400 italic mt-1">{idea.tagline}</p>
                  </div>
                  <span className="font-ui text-[10px] text-stone-500 tracking-wider shrink-0">
                    {idea.author} · {new Date(idea.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {idea.videoUrl && <VideoEmbed url={idea.videoUrl} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {idea.hook && (
                    <div>
                      <p className="font-ui text-[10px] text-amber-500/50 tracking-wider uppercase mb-1">The Hook</p>
                      <p className="font-body text-xs text-stone-400 leading-relaxed">{idea.hook}</p>
                    </div>
                  )}
                  {idea.world && (
                    <div>
                      <p className="font-ui text-[10px] text-amber-500/50 tracking-wider uppercase mb-1">The World</p>
                      <p className="font-body text-xs text-stone-400 leading-relaxed">{idea.world}</p>
                    </div>
                  )}
                  {idea.cast && (
                    <div>
                      <p className="font-ui text-[10px] text-amber-500/50 tracking-wider uppercase mb-1">The Cast</p>
                      <p className="font-body text-xs text-stone-400 leading-relaxed">{idea.cast}</p>
                    </div>
                  )}
                  {idea.onRamp && (
                    <div>
                      <p className="font-ui text-[10px] text-amber-500/50 tracking-wider uppercase mb-1">The On-Ramp</p>
                      <p className="font-body text-xs text-stone-400 leading-relaxed">{idea.onRamp}</p>
                    </div>
                  )}
                </div>

                <ReactionChips sectionId={idea.id} reactions={reactions} onReact={onReact} />
                <CommentThread sectionId={idea.id} questions={questions} onSubmit={onSubmitQuestion} />
              </div>
            );
          })}
        </div>
      )}

      {/* Submit new idea */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 hover:bg-white/[0.05] transition-all group"
        >
          <p className="font-display text-xl text-stone-400 group-hover:text-white transition-colors">
            + Pitch a new show concept
          </p>
          <p className="font-ui text-[11px] text-stone-500 mt-2">
            Use the brainstorm framework above to structure your idea
          </p>
        </button>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8">
          <p className="font-display text-xl text-white mb-6">Pitch your concept</p>
          <div className="space-y-4">
            <div>
              <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Show Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                placeholder="e.g., The Last Season"
              />
            </div>
            <div>
              <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Tagline / One-line pitch *</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                placeholder="The hook that gets a skeptic to watch episode one"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">The Hook</label>
                <textarea
                  value={form.hook}
                  onChange={(e) => setForm({ ...form, hook: e.target.value })}
                  className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
                  rows={3}
                  placeholder="What human drive does this show tap into?"
                />
              </div>
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">The World</label>
                <textarea
                  value={form.world}
                  onChange={(e) => setForm({ ...form, world: e.target.value })}
                  className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
                  rows={3}
                  placeholder="Where does it take place? What is the place losing?"
                />
              </div>
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">The Cast</label>
                <textarea
                  value={form.cast}
                  onChange={(e) => setForm({ ...form, cast: e.target.value })}
                  className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
                  rows={3}
                  placeholder="Who is in the show? Cast for friction."
                />
              </div>
              <div>
                <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">The On-Ramp</label>
                <textarea
                  value={form.onRamp}
                  onChange={(e) => setForm({ ...form, onRamp: e.target.value })}
                  className="w-full text-xs text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-500/50 font-ui"
                  rows={3}
                  placeholder="What does the viewer do after watching?"
                />
              </div>
            </div>
            <div>
              <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Video URL (optional)</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                placeholder="YouTube or Vimeo link"
              />
            </div>
            <div>
              <label className="font-ui text-[10px] text-stone-400 tracking-wider uppercase block mb-1">Your name</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full text-sm text-stone-300 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/50 font-ui"
                placeholder="Anonymous is fine"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-amber-500 text-black font-ui text-xs tracking-wider uppercase rounded-full hover:bg-amber-400 transition-colors"
              >
                Submit Concept
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 font-ui text-xs tracking-wider uppercase text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [brainstormEntries, setBrainstormEntries] = useState<BrainstormEntry[]>([]);

  useEffect(() => {
    fetch('/api/questions').then((r) => r.json()).then(setQuestions).catch(() => {});
    fetch('/api/reactions').then((r) => r.json()).then(setReactions).catch(() => {});
    fetch('/api/ideas').then((r) => r.json()).then(setIdeas).catch(() => {});
    fetch('/api/videos').then((r) => r.json()).then(setVideos).catch(() => {});
    fetch('/api/brainstorm').then((r) => r.json()).then(setBrainstormEntries).catch(() => {});
  }, []);

  const submitQuestion = useCallback(async (sectionId: string, text: string, author: string) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, text, author }),
      });
      if (res.ok) {
        const newQ = await res.json();
        setQuestions((prev) => [...prev, newQ]);
      }
    } catch { /* */ }
  }, []);

  const submitReaction = useCallback(async (sectionId: string, reaction: string) => {
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, reaction }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReactions((prev) => ({ ...prev, [sectionId]: updated }));
      }
    } catch { /* */ }
  }, []);

  const submitIdea = useCallback(async (form: any) => {
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newIdea = await res.json();
        setIdeas((prev) => [...prev, newIdea]);
      }
    } catch { /* */ }
  }, []);

  const submitBrainstorm = useCallback(async (section: string, questionLabel: string, response: string, author: string) => {
    try {
      const res = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, questionLabel, response, author }),
      });
      if (res.ok) {
        const entry = await res.json();
        setBrainstormEntries((prev) => [...prev, entry]);
      }
    } catch { /* */ }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ProgressBar />
      <StickyNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <p className="font-ui text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-16">
            {hero.supertitle}
          </p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-[110px] text-white leading-[0.92] tracking-tight mb-8">
            Climate <span className="text-amber-500">&</span>
            <br />
            Reality <span className="italic font-normal text-stone-400">TV</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-stone-400 leading-relaxed max-w-lg mb-6">
            {hero.subtitle}
          </p>

          <div className="w-16 h-[1px] bg-amber-500/40 mb-12" />

          <div className="flex flex-col md:flex-row md:items-end md:gap-16">
            <div>
              <p className="font-ui text-sm text-stone-300 tracking-wide">{hero.authors}</p>
              <p className="font-ui text-xs text-stone-500 tracking-wider mt-1">{hero.course}</p>
            </div>
          </div>

          <div className="mt-24 flex justify-center">
            <button
              onClick={() => document.getElementById('principles')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-stone-500 hover:text-amber-400 transition-colors animate-bounce"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Design Principles ─────────────────────────────────────────────── */}
      <section id="principles" className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
        <div className="max-w-5xl mx-auto">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-6">Our North Star</p>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05] tracking-tight mb-16">
            Design <span className="italic text-stone-400">Principles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {designPrinciples.map((dp, i) => {
              const { ref, isVisible } = useInView(0.1);
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="font-ui text-[11px] text-amber-500/60 tracking-widest">{dp.number}</span>
                  <h3 className="font-display text-xl md:text-2xl text-white leading-tight tracking-tight mt-3 mb-4">
                    {dp.title}
                  </h3>
                  <p className="font-body text-sm text-stone-400 leading-relaxed">{dp.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Statement ─────────────────────────────────────────────────────── */}
      {(() => {
        const { ref, isVisible } = useInView(0.2);
        return (
          <div ref={ref} className="min-h-[60vh] flex items-center justify-center px-6 md:px-16 bg-[#0d0d0d]">
            <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <p className="font-display text-2xl md:text-4xl lg:text-5xl text-white leading-[1.2] tracking-tight italic">
                "Don't lead with climate. Lead with the thing that makes someone change the channel."
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Show Concepts ─────────────────────────────────────────────────── */}
      <section id="concepts" className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
        <div className="max-w-4xl mx-auto">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-6">Three Directions</p>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05] tracking-tight mb-8">
            Sacrificial <span className="italic text-stone-400">Concepts</span>
          </h2>
          <p className="font-body text-[17px] text-stone-400 leading-[1.9] max-w-2xl mb-16">
            Three show concepts designed to reach people who would never watch a climate documentary.
            Each one buries the climate message inside a format audiences already love.
          </p>

          <div className="divide-y divide-white/[0.06]">
            {showConcepts.map((concept) => (
              <ShowConceptCard
                key={concept.id}
                concept={concept}
                videos={videos}
                reactions={reactions}
                questions={questions}
                onReact={submitReaction}
                onSubmitQuestion={submitQuestion}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Transition Quote ──────────────────────────────────────────────── */}
      {(() => {
        const { ref, isVisible } = useInView(0.2);
        return (
          <div ref={ref} className="min-h-[60vh] flex items-center justify-center px-6 md:px-16 bg-[#0d0d0d]">
            <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <p className="font-display text-2xl md:text-4xl lg:text-5xl text-white leading-[1.2] tracking-tight italic">
                "Now it's your turn."
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Brainstorm ────────────────────────────────────────────────────── */}
      <section id="brainstorm" className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
        <div className="max-w-3xl mx-auto">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-6">Your Turn</p>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05] tracking-tight mb-8">
            Brainstorm <span className="italic text-stone-400">Worksheet</span>
          </h2>
          <p className="font-body text-[17px] text-stone-400 leading-[1.9] max-w-2xl mb-16">
            Use these prompts to develop your own show concept. Every answer you submit becomes part of our collective research.
          </p>

          <BrainstormSection brainstormEntries={brainstormEntries} onSubmit={submitBrainstorm} />
        </div>
      </section>

      {/* ── Community Ideas ───────────────────────────────────────────────── */}
      <section id="community" className="px-6 md:px-12 lg:px-20 py-24 md:py-36 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <p className="font-ui text-[10px] text-amber-500/50 uppercase tracking-[0.3em] mb-6">Community</p>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05] tracking-tight mb-8">
            New <span className="italic text-stone-400">Concepts</span>
          </h2>
          <p className="font-body text-[17px] text-stone-400 leading-[1.9] max-w-2xl mb-16">
            Show ideas from our brainstorm sessions and collaborators. Every concept here started as a worksheet answer.
          </p>

          <CommunitySection
            ideas={ideas}
            reactions={reactions}
            questions={questions}
            onSubmitIdea={submitIdea}
            onReact={submitReaction}
            onSubmitQuestion={submitQuestion}
          />
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-8">
          <div>
            <p className="font-display text-2xl md:text-3xl text-white tracking-tight mb-4">
              This research is <span className="italic text-amber-400">ongoing.</span>
            </p>
            <p className="font-body text-stone-500 text-sm leading-relaxed max-w-md">
              If you have ideas for climate-conscious entertainment formats, show concepts,
              or want to contribute to this research, reach out.
            </p>
          </div>
          <div className="text-right">
            <p className="font-ui text-[10px] text-stone-500 uppercase tracking-[0.3em]">
              GSB GEN 390 · Climate & Reality TV
            </p>
            <p className="mt-2 font-ui text-xs text-stone-500">
              Daniel Etzioni & Nazlican Goksu · Stanford GSB · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
