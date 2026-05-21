import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CREAM = '#f4efe6';
const INK = '#0d0d0d';
const RED = '#d4202c';
const PINK = '#ff2cb4';

// ─── collage palette + ransom-note wordmark (ALREADY ON AIR) ──────
const LIME = '#cdf23a';
const PURPLE = '#7a1fa2';
const ORANGE = '#ee6c1a';
const YELLOW = '#ffd400';
const SKY = '#3bb0ff';

type LetterVariant = 'rh' | 'belowdeck' | 'loveisland' | 'lime' | 'purple' | 'orange' | 'mono' | 'pink';

function tileStyle(v: LetterVariant): React.CSSProperties {
  const archivo = "'Archivo', system-ui, sans-serif";
  switch (v) {
    case 'rh': return { background: `linear-gradient(135deg, ${PINK}, ${PURPLE})`, color: '#fff', fontFamily: archivo, fontWeight: 900, borderRadius: 10 };
    case 'belowdeck': return { background: INK, color: YELLOW, fontFamily: archivo, fontWeight: 900, letterSpacing: '-0.02em' };
    case 'loveisland': return { background: SKY, color: '#fff', fontFamily: archivo, fontWeight: 800, borderRadius: 999, textTransform: 'lowercase' };
    case 'lime': return { background: LIME, color: INK, fontFamily: archivo, fontWeight: 900 };
    case 'purple': return { background: PURPLE, color: CREAM, fontFamily: archivo, fontWeight: 900 };
    case 'orange': return { background: ORANGE, color: INK, fontFamily: archivo, fontWeight: 900 };
    case 'pink': return { background: PINK, color: CREAM, fontFamily: archivo, fontWeight: 900 };
    case 'mono': return { background: CREAM, color: INK, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 500, border: `2px solid ${INK}` };
  }
}

const WORDMARK: { ch: string; v: LetterVariant; rot: number }[][] = [
  [
    { ch: 'A', v: 'rh', rot: -4 }, { ch: 'L', v: 'lime', rot: 3 }, { ch: 'R', v: 'purple', rot: -2 },
    { ch: 'E', v: 'belowdeck', rot: 4 }, { ch: 'A', v: 'orange', rot: -3 }, { ch: 'D', v: 'mono', rot: 2 },
    { ch: 'Y', v: 'pink', rot: -2 },
  ],
  [ { ch: 'O', v: 'loveisland', rot: 3 }, { ch: 'N', v: 'lime', rot: -3 } ],
  [ { ch: 'A', v: 'purple', rot: -2 }, { ch: 'I', v: 'belowdeck', rot: 3 }, { ch: 'R', v: 'rh', rot: -4 } ],
];

const RansomWordmark: React.FC = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px 16px' }} aria-label="Already On Air">
    {WORDMARK.map((word, wi) => (
      <span key={wi} style={{ display: 'inline-flex', gap: 7 }}>
        {word.map((l, li) => (
          <span
            key={li}
            style={{
              ...tileStyle(l.v),
              display: 'inline-block',
              fontSize: 'clamp(40px, 9vw, 104px)',
              lineHeight: 0.95,
              padding: '6px 16px 9px',
              transform: `rotate(${l.rot}deg)`,
              boxShadow: '4px 4px 0 rgba(13,13,13,0.5)',
              borderRadius: (tileStyle(l.v) as React.CSSProperties).borderRadius ?? 4,
            }}
          >
            {l.v === 'loveisland' ? l.ch.toLowerCase() : l.ch}
          </span>
        ))}
      </span>
    ))}
  </div>
);

type Frame =
  | { kind: 'text'; lines: string[]; bg: string; color: string; duration: number; size?: 'xl' | 'lg' | 'md' | 'sm'; serif?: boolean }
  | { kind: 'beat'; bg: string; duration: number }
  | { kind: 'chapter'; n: string; bg: string; color: string; accent: string; duration: number }
  | { kind: 'borrowshow'; show: string; hook: string; tint: string; bg: string; color: string; duration: number }
  | { kind: 'question'; badge: string; question: string; highlight: string; bg: string; color: string; duration: number }
  | { kind: 'finding'; index: number; total: number; finding: string; detail?: string; citation: string; journal: string; bg: string; color: string; duration: number }
  | { kind: 'showcard'; index: number; total: number; title: string; genre: string; premise: string; bg: string; color: string; accent: string; duration: number; collage?: boolean }
  | { kind: 'couple'; index: number; total: number; a: string; b: string; bg: string; color: string; duration: number }
  | { kind: 'pair'; a: string; b: string; bg: string; color: string; accent: string; duration: number }
  | { kind: 'takeaway'; badge: string; line1: string; line2: string; sub?: string; bg: string; color: string; accent: string; duration: number }
  | { kind: 'cta'; bg: string; color: string };

const FRAMES: Frame[] = [
  // ─── COLD OPEN ───
  { kind: 'beat', bg: INK, duration: 700 },
  { kind: 'text', lines: ['Climate is no longer Top-3', 'on either side of the aisle.'], bg: INK, color: CREAM, duration: 2600, size: 'md' },
  { kind: 'text', lines: ["Half the country won't", 'say the word out loud.'], bg: INK, color: CREAM, duration: 2600, size: 'md' },
  { kind: 'beat', bg: INK, duration: 400 },
  { kind: 'text', lines: ["What's failing isn't the science."], bg: INK, color: CREAM, duration: 2000, size: 'md' },
  { kind: 'text', lines: ['It’s the lecture.'], bg: INK, color: PINK, duration: 2200, size: 'xl', serif: true },
  { kind: 'beat', bg: INK, duration: 600 },

  // ─── THE QUESTION ───
  {
    kind: 'question',
    badge: 'ONE QUESTION WE COULDN\'T LET GO OF',
    question: 'What would it take to reach the audience the climate movement has lost — without ever saying the word climate?',
    highlight: 'the audience the climate movement has lost',
    bg: INK, color: CREAM, duration: 8500,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── PROCESS ───
  { kind: 'text', lines: ['Sixteen academic papers.', 'Twenty-plus interviews.', 'Two group brainstorms.', 'Hollywood expert sessions.'], bg: INK, color: CREAM, duration: 3000, size: 'sm' },
  { kind: 'text', lines: ['Five findings', 'kept coming back.'], bg: INK, color: CREAM, duration: 2800, size: 'lg' },
  { kind: 'beat', bg: INK, duration: 400 },

  // ─── THE FOUR FINDINGS ───
  {
    kind: 'finding', index: 1, total: 5,
    finding: 'The more scientifically literate a Republican becomes, the more skeptical of climate science they tend to be — and the same effect runs in reverse for Democrats.',
    detail: "Climate isn't a literacy problem. It's an identity one. More facts deepen the fracture; they don't close it.",
    citation: 'KAHAN, D.M. (2015)',
    journal: 'YALE · CULTURAL COGNITION PROJECT · POLITICAL PSYCHOLOGY 36',
    bg: INK, color: CREAM, duration: 10000,
  },
  {
    kind: 'finding', index: 2, total: 5,
    finding: 'Audiences absorbed in a narrative drop the counterarguing reflex and adopt story-consistent beliefs.',
    detail: "The argument can't get through the defenses. The story can.",
    citation: 'GREEN, M.C. & BROCK, T.C. (2000)',
    journal: 'PENN · JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY',
    bg: INK, color: CREAM, duration: 8000,
  },
  {
    kind: 'finding', index: 3, total: 5,
    finding: "MTV's “16 and Pregnant” drove a 4.3% drop in teen birth rates in the eighteen months after it first aired.",
    detail: "It accounted for nearly a quarter of the total decline in U.S. teen childbearing during that period — the first hard evidence that a single reality TV show could move real-world behavior at population scale.",
    citation: 'KEARNEY, M.S. & LEVINE, P.B. (2015)',
    journal: 'AMERICAN ECONOMIC REVIEW · NBER',
    bg: INK, color: CREAM, duration: 11000,
  },
  {
    kind: 'finding', index: 4, total: 5,
    finding: 'Climate ads featuring “surprising messengers” moved Republican voters seven points on belief and ten on human cause.',
    detail: 'A former Republican congressman. An Air Force general. An evangelical climate scientist. Sunstein calls these figures “surprising validators” — and the audience cannot dismiss them as the other team.',
    citation: 'GOLDBERG, GUSTAFSON, MAIBACH & LEISEROWITZ (2021)',
    journal: 'NATURE CLIMATE CHANGE · VOL. 11',
    bg: INK, color: CREAM, duration: 11000,
  },
  {
    kind: 'finding', index: 5, total: 5,
    finding: 'Stories change behavior when people watch them together, not alone.',
    detail: "In Rwanda, a radio drama heard in monthly groups changed how people acted, even when private beliefs barely moved. In Uganda, the same videos cut reported domestic violence by a quarter when watched in groups, and did nothing when watched alone. The lever isn't the message. It's watching together.",
    citation: 'PALUCK & GREEN (2009) · GREEN, WILKE & COOPER (2020)',
    journal: 'AMERICAN POLITICAL SCIENCE REVIEW · COMPARATIVE POLITICAL STUDIES',
    bg: INK, color: CREAM, duration: 11000,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── THE BET ───
  { kind: 'text', lines: ['So we landed on', 'three ideas.'], bg: INK, color: CREAM, duration: 2200, size: 'lg' },
  { kind: 'text', lines: ['Same research.', 'Three different doors.'], bg: INK, color: CREAM, duration: 2200, size: 'md' },

  // ─── CROSSFIRE ───
  { kind: 'chapter', n: '01', bg: INK, color: CREAM, accent: RED, duration: 1900 },
  { kind: 'beat', bg: RED, duration: 500 },
  {
    kind: 'showcard', index: 1, total: 3,
    title: 'CROSSFIRE.',
    genre: 'Documentary-style reality TV · 6 × 60′',
    premise: 'Six American families who disagree about climate change but love each other anyway.',
    bg: RED, color: CREAM, accent: CREAM, duration: 6000,
  },
  {
    kind: 'pair',
    a: 'A climate-organizing mother',
    b: 'and the son who came home rejecting it all.',
    bg: RED, color: CREAM, accent: CREAM, duration: 3600,
  },
  {
    kind: 'pair',
    a: 'A pastor',
    b: 'and his climate-scientist daughter.',
    bg: RED, color: CREAM, accent: CREAM, duration: 3200,
  },
  {
    kind: 'pair',
    a: 'A rancher',
    b: 'and the son who came home doing it differently.',
    bg: RED, color: CREAM, accent: CREAM, duration: 3600,
  },
  { kind: 'text', lines: ['Cameras embed in their kitchens', 'for three to four months.'], bg: RED, color: CREAM, duration: 3200, size: 'md' },
  { kind: 'text', lines: ['No narrator.', 'No confessionals.', 'Just dinner.'], bg: RED, color: CREAM, duration: 2800, size: 'md' },
  { kind: 'text', lines: ['Finale: six dinners,', 'six time zones, one hour.'], bg: RED, color: CREAM, duration: 3200, size: 'lg' },
  {
    kind: 'takeaway',
    badge: 'CROSSFIRE · THE SO-WHAT',
    line1: 'Get families talking about climate again.',
    line2: 'Without anyone leaving the table.',
    bg: RED, color: CREAM, accent: CREAM, duration: 7500,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── ONE LAST THING ───
  { kind: 'chapter', n: '02', bg: INK, color: CREAM, accent: PINK, duration: 1900 },
  { kind: 'beat', bg: PINK, duration: 500 },
  {
    kind: 'showcard', index: 2, total: 3,
    title: 'ONE LAST THING.',
    genre: 'Unscripted dating series · 10 episodes',
    premise: 'Sixteen strangers fall in love in post-fire LA, with two rules they cannot break.',
    bg: PINK, color: INK, accent: INK, duration: 6000,
  },
  { kind: 'text', lines: ['One glass house above Altadena.', 'A 14,000-acre burn scar in every window.'], bg: PINK, color: INK, duration: 3400, size: 'md' },
  { kind: 'text', lines: ['Two rules.', "They can't reveal their politics", 'or their profession.'], bg: PINK, color: INK, duration: 3600, size: 'md' },
  { kind: 'text', lines: ['For ten weeks they answer the 36 Questions:', 'the famous experiment built to make two strangers fall in love.'], bg: PINK, color: INK, duration: 3600, size: 'md' },
  { kind: 'text', lines: ['When a couple proposes,', 'they reveal the one last thing.'], bg: PINK, color: INK, duration: 3000, size: 'md' },
  {
    kind: 'couple', index: 1, total: 3,
    a: "I don’t vote. But climate change keeps me up at night.",
    b: "I’m a Republican. And nature protection is the most urgent thing we have.",
    bg: PINK, color: INK, duration: 6200,
  },
  {
    kind: 'couple', index: 2, total: 3,
    a: "I work on a rig. I want my kids to grow up somewhere green.",
    b: "I’m a climate organizer. My own dad lost his coal job to the transition I fight for.",
    bg: PINK, color: INK, duration: 6200,
  },
  {
    kind: 'couple', index: 3, total: 3,
    a: "I’m a coal miner’s daughter. I’m voting blue this November.",
    b: "I’m a Brooklyn vegan. I drive a pickup truck.",
    bg: PINK, color: INK, duration: 6200,
  },
  { kind: 'text', lines: ['They already chose each other.', 'Now they find out who.'], bg: PINK, color: INK, duration: 3400, size: 'lg', serif: true },
  { kind: 'text', lines: ['Then they walk the aisle and decide:', 'marry this person, or walk away.'], bg: PINK, color: INK, duration: 3400, size: 'md' },
  {
    kind: 'takeaway',
    badge: 'ONE LAST THING · THE SO-WHAT',
    line1: 'Make climate bigger than politics.',
    line2: 'By falling for the person first.',
    bg: PINK, color: INK, accent: INK, duration: 7500,
  },
  { kind: 'beat', bg: INK, duration: 700 },

  // ─── ALREADY ON AIR (idea 3 — the collage / borrow bet) ───
  { kind: 'text', lines: ['But the biggest climate audience', 'was already watching something else.'], bg: INK, color: CREAM, duration: 3200, size: 'md' },
  { kind: 'chapter', n: '03', bg: INK, color: CREAM, accent: PURPLE, duration: 1900 },
  { kind: 'beat', bg: CREAM, duration: 500 },
  {
    kind: 'showcard', index: 3, total: 3, collage: true,
    title: 'ALREADY ON AIR.',
    genre: 'Embedded climate · shows already on the air',
    premise: "Don't build a climate show. Borrow the ones America already can't stop watching.",
    bg: CREAM, color: INK, accent: PURPLE, duration: 6500,
  },
  { kind: 'text', lines: ['No new show. No pitch to sell.', 'The climate is already in the frame.'], bg: CREAM, color: INK, duration: 3000, size: 'md' },
  { kind: 'borrowshow', show: 'The Real Housewives of the Palisades', hook: 'The rebuild is the whole season.', tint: PINK, bg: CREAM, color: INK, duration: 3400 },
  { kind: 'borrowshow', show: 'Below Deck: Storm Season', hook: 'The captain reroutes all season.', tint: YELLOW, bg: CREAM, color: INK, duration: 3400 },
  { kind: 'borrowshow', show: 'Love Island: Heat Dome', hook: 'Too hot to film. Too big to politicize.', tint: SKY, bg: CREAM, color: INK, duration: 3400 },
  {
    kind: 'takeaway',
    badge: 'ALREADY ON AIR · THE SO-WHAT',
    line1: "Reach the people who'd never watch a climate show.",
    line2: 'Inside the shows they already love.',
    bg: CREAM, color: INK, accent: PURPLE, duration: 7500,
  },
  { kind: 'beat', bg: INK, duration: 700 },

  // ─── CLOSE ───
  { kind: 'text', lines: ['The climate movement', 'has a storytelling problem.'], bg: INK, color: CREAM, duration: 2600, size: 'lg' },
  { kind: 'text', lines: ['Reality TV', 'could fix it.'], bg: INK, color: PINK, duration: 2800, size: 'xl', serif: true },

  // ─── CTA ───
  { kind: 'cta', bg: INK, color: CREAM },
];

const AUTO_REDIRECT_MS = 5000;

function HighlightSweep({ text, highlight }: { text: string; highlight: string }) {
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <span className="hl-sweep">{match}</span>
      {after}
    </>
  );
}

export default function Trailer() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(AUTO_REDIRECT_MS / 1000));
  const remainingRef = useRef<number>(0);

  useEffect(() => {
    document.title = 'The climate movement has a storytelling problem.';
  }, []);

  // Reset remaining time on frame change
  useEffect(() => {
    const frame = FRAMES[i];
    remainingRef.current = frame.kind === 'cta' ? 0 : frame.duration;
  }, [i]);

  // Auto-advance — pausable
  useEffect(() => {
    const frame = FRAMES[i];
    if (frame.kind === 'cta') return;
    if (paused) return;
    if (remainingRef.current <= 0) return;

    const start = Date.now();
    const remainingAtStart = remainingRef.current;
    const t = setTimeout(() => {
      remainingRef.current = 0;
      setI((x) => Math.min(x + 1, FRAMES.length - 1));
    }, remainingAtStart);

    return () => {
      clearTimeout(t);
      const elapsed = Date.now() - start;
      remainingRef.current = Math.max(0, remainingAtStart - elapsed);
    };
  }, [i, paused]);

  // CTA auto-redirect — also pausable
  useEffect(() => {
    if (FRAMES[i].kind !== 'cta') return;
    if (paused) {
      // freeze countdown display while paused
      return;
    }
    const start = Date.now();
    const carryover = AUTO_REDIRECT_MS - (Math.ceil(AUTO_REDIRECT_MS / 1000) - countdown) * 1000;
    const tick = setInterval(() => {
      const remaining = Math.max(0, carryover - (Date.now() - start));
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        clearInterval(tick);
        navigate('/paper');
      }
    }, 100);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, navigate]);

  function skip() { navigate('/paper'); }
  function togglePause() { setPaused(p => !p); }
  function goBack() { remainingRef.current = 0; setI(x => Math.max(0, x - 1)); }
  function goForward() { remainingRef.current = 0; setI(x => Math.min(FRAMES.length - 1, x + 1)); }
  function restart() {
    setI(0);
    setCountdown(Math.ceil(AUTO_REDIRECT_MS / 1000));
    setPaused(false);
  }

  const f = FRAMES[i];
  const isSerifText = f.kind === 'text' && f.serif === true;
  // Controls must stay legible on light frames (CREAM / PINK) too.
  const onLight = f.bg === CREAM || f.bg === PINK;
  const ctrl = onLight ? 'rgba(13,13,13,0.85)' : 'rgba(244,239,230,0.85)';
  const ctrlDim = onLight ? 'rgba(13,13,13,0.32)' : 'rgba(244,239,230,0.3)';
  const ctrlFaint = onLight ? 'rgba(13,13,13,0.16)' : 'rgba(244,239,230,0.18)';

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div
        className={paused ? 'tr-paused' : undefined}
        style={{
          position: 'fixed', inset: 0,
          background: f.bg, color: 'color' in f ? f.color : CREAM,
          transition: 'background 0.6s ease, color 0.6s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px', overflow: 'hidden',
          cursor: f.kind === 'cta' || paused ? 'default' : 'pointer',
        }}
        onClick={() => { if (paused || f.kind === 'cta') return; setI((x) => Math.min(x + 1, FRAMES.length - 1)); }}
      >
        {f.kind === 'text' && (
          <div key={i} style={{ maxWidth: 1100, textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {f.lines.map((line, j) => (
              <p
                key={j}
                className="tr-balance"
                style={{
                  fontFamily: isSerifText ? "'Fraunces', Georgia, serif" : "'Archivo', system-ui, sans-serif",
                  fontStyle: isSerifText ? 'italic' : 'normal',
                  fontWeight: isSerifText ? 600 : f.size === 'xl' ? 900 : 800,
                  fontSize:
                    f.size === 'xl' ? 'clamp(56px, 10vw, 120px)' :
                    f.size === 'lg' ? 'clamp(36px, 6.5vw, 80px)' :
                    f.size === 'sm' ? 'clamp(20px, 3vw, 36px)' :
                    'clamp(28px, 5vw, 56px)',
                  lineHeight: 1.05,
                  letterSpacing: f.size === 'xl' ? '-0.03em' : '-0.02em',
                  margin: j === 0 ? '0' : '12px 0 0',
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {f.kind === 'chapter' && (
          <div key={i} style={{ textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(52px, 9.5vw, 124px)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
            }}>Idea <span style={{ color: f.accent }}>{f.n}</span></p>
          </div>
        )}

        {f.kind === 'borrowshow' && (
          <div key={i} style={{ maxWidth: 1100, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p className="tr-balance" style={{ margin: '0 auto 22px', maxWidth: 1000 }}>
              <span style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(34px, 5.6vw, 80px)',
                lineHeight: 1.32,
                letterSpacing: '-0.02em',
                color: INK,
                background: `linear-gradient(transparent 54%, ${f.tint} 54%)`,
                boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
                padding: '0 8px',
              }}>{f.show}</span>
            </p>
            <p className="tr-balance" style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(20px, 3vw, 36px)',
              lineHeight: 1.25,
              margin: '0 auto',
              maxWidth: 800,
              opacity: 0.8,
            }}>{f.hook}</p>
          </div>
        )}

        {f.kind === 'question' && (
          <div key={i} style={{ maxWidth: 1000, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p className="tr-balance" style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(30px, 5vw, 68px)',
              lineHeight: 1.2,
              letterSpacing: '-0.012em',
              margin: '0 auto',
            }}>
              <HighlightSweep text={f.question} highlight={f.highlight}/>
            </p>
          </div>
        )}

        {f.kind === 'finding' && (
          <div key={i} style={{ maxWidth: 1000, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p className="tr-balance" style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 400,
              fontSize: 'clamp(30px, 5vw, 68px)',
              lineHeight: 1.16,
              letterSpacing: '-0.012em',
              margin: '0 auto',
            }}>{f.finding}</p>

            {f.detail && (
              <p className="tr-balance" style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontSize: 'clamp(16px, 2.1vw, 24px)',
                lineHeight: 1.45,
                opacity: 0.7,
                margin: '26px auto 0',
                maxWidth: 760,
                fontWeight: 400,
              }}>{f.detail}</p>
            )}

            <p style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11, letterSpacing: '0.22em',
              opacity: 0.4, margin: '34px 0 0',
            }}>{f.citation}</p>
          </div>
        )}

        {f.kind === 'couple' && (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            animation: 'tr-in 700ms ease',
          }}>
            {/* Speaker A — italic serif, left-aligned, soft */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(40px, 6vw, 96px)',
              borderRight: '1px solid rgba(0,0,0,0.18)',
            }}>
              <span aria-hidden style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(96px, 9vw, 144px)',
                lineHeight: 0.55,
                color: 'currentColor', opacity: 0.35,
                marginBottom: 22,
                userSelect: 'none',
              }}>“</span>
              <p style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3.2vw, 44px)',
                lineHeight: 1.28,
                letterSpacing: '-0.005em',
                margin: 0,
                maxWidth: 520,
              }}>{f.a}</p>
            </div>

            {/* Speaker B — bold sans-serif, right-aligned */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end',
              padding: 'clamp(40px, 6vw, 96px)',
              textAlign: 'right',
            }}>
              <span aria-hidden style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(96px, 9vw, 144px)',
                lineHeight: 0.7,
                color: 'currentColor', opacity: 0.35,
                marginBottom: 22,
                userSelect: 'none',
              }}>“</span>
              <p style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(22px, 3vw, 40px)',
                lineHeight: 1.22,
                letterSpacing: '-0.012em',
                margin: 0,
                maxWidth: 520,
              }}>{f.b}</p>
            </div>
          </div>
        )}

        {f.kind === 'pair' && (
          <div key={i} style={{ maxWidth: 1100, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(34px, 5.4vw, 76px)',
              lineHeight: 1.05,
              letterSpacing: '-0.012em',
              margin: '0 auto',
              maxWidth: 880,
            }}>{f.a}</p>

            <p aria-hidden style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(24px, 3vw, 36px)',
              color: f.accent,
              fontWeight: 400,
              margin: '20px 0',
            }}>&amp;</p>

            <p style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4.4vw, 60px)',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: '0 auto',
              maxWidth: 980,
              textTransform: 'none',
            }}>{f.b}</p>
          </div>
        )}

        {f.kind === 'takeaway' && (
          <div key={i} style={{ maxWidth: 920, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase',
              color: f.accent, margin: '0 0 24px', fontWeight: 500,
            }}>The goal</p>

            <p className="tr-balance" style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(34px, 5.2vw, 72px)',
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
              margin: '0 auto',
            }}>{f.line1}</p>

            {f.line2 && (
              <p className="tr-balance" style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(18px, 2.4vw, 28px)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                opacity: 0.65,
                margin: '18px auto 0',
              }}>{f.line2}</p>
            )}
          </div>
        )}

        {f.kind === 'showcard' && (
          <div key={i} style={{ maxWidth: 1180, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {f.collage ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 36px' }}>
                <RansomWordmark />
              </div>
            ) : (
              <p style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(72px, 13vw, 168px)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                margin: '0 0 28px',
              }}>{f.title}</p>
            )}

            <p className="tr-balance" style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(22px, 3.4vw, 44px)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              margin: '0 auto',
              maxWidth: 880,
            }}>{f.premise}</p>
          </div>
        )}

        {f.kind === 'cta' && (
          <div key="cta" style={{ textAlign: 'center', animation: 'tr-in 700ms ease', maxWidth: 1100 }}>
            <p style={{
              fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 900,
              fontSize: 'clamp(40px, 7vw, 84px)', lineHeight: 1.02, letterSpacing: '-0.025em',
              margin: 0, color: CREAM,
            }}>
              The climate movement has a storytelling problem.
            </p>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontWeight: 600,
              fontSize: 'clamp(32px, 5.4vw, 68px)', lineHeight: 1.02, color: PINK,
              margin: '18px 0 48px',
            }}>
              Reality TV could fix it.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/paper"
                style={{
                  background: CREAM, color: INK, border: 'none',
                  padding: '14px 24px', borderRadius: 999, textDecoration: 'none',
                  fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800,
                  fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                }}
              >Read the research now →</Link>
              <button
                onClick={restart}
                style={{
                  background: 'transparent', color: CREAM, border: `1px solid ${CREAM}`,
                  padding: '14px 24px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800,
                  fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                }}
              >↻ Watch again</button>
            </div>
            <p style={{
              marginTop: 32, color: 'rgba(244,239,230,0.45)',
              fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              Continuing to the research in {countdown}s
            </p>
          </div>
        )}

        {/* Pause + Skip + progress */}
        {f.kind !== 'cta' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); togglePause(); }}
              aria-label={paused ? 'Resume trailer' : 'Pause trailer'}
              style={{
                position: 'absolute', bottom: 24, left: 24,
                background: paused ? 'rgba(255,44,180,0.18)' : 'transparent',
                border: `1px solid ${paused ? PINK : ctrlDim}`,
                color: paused ? PINK : ctrl,
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 700,
                zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 10 }}>{paused ? '▶' : '❚❚'}</span>
              <span>{paused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); skip(); }}
              style={{
                position: 'absolute', bottom: 24, right: 24,
                background: 'transparent', border: `1px solid ${ctrlDim}`,
                color: ctrl,
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                zIndex: 10,
              }}
            >Skip to research →</button>
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); goBack(); }}
                disabled={i === 0}
                aria-label="Previous frame"
                style={{
                  background: 'transparent', border: 'none', cursor: i === 0 ? 'default' : 'pointer',
                  color: ctrl, opacity: i === 0 ? 0.2 : 0.65,
                  fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 34, lineHeight: 1,
                  padding: '2px 10px', transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { if (i !== 0) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { if (i !== 0) (e.currentTarget as HTMLButtonElement).style.opacity = '0.65'; }}
              >‹</button>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {FRAMES.map((_, idx) => (
                  <span key={idx} style={{
                    width: idx === i ? 18 : 5, height: 4, borderRadius: 2,
                    background: idx <= i ? ctrl : ctrlFaint,
                    transition: 'width 0.4s, background 0.4s',
                  }} />
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); goForward(); }}
                aria-label="Next frame"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: ctrl, opacity: 0.65,
                  fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 34, lineHeight: 1,
                  padding: '2px 10px', transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.65'; }}
              >›</button>
            </div>
            {paused && (
              <div className="tr-paused-indicator" style={{
                position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                background: PINK, color: INK,
                padding: '6px 14px', borderRadius: 999,
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 10,
                letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 800,
                animation: 'tr-pulse 1.6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 11,
              }}>● Paused</div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes tr-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Keep long lines from leaving a single orphan word on the last row. */
        .tr-balance { text-wrap: balance; }
        @keyframes tr-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(0.85); }
        }
        @keyframes hl-sweep-anim {
          from { background-size: 0% 38%; }
          to   { background-size: 100% 38%; }
        }
        .hl-sweep {
          background-image: linear-gradient(${PINK}, ${PINK});
          background-repeat: no-repeat;
          background-position: 0 90%;
          background-size: 0% 38%;
          animation: hl-sweep-anim 1.4s 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          padding: 0 2px;
        }
        /* Freeze every running animation inside the trailer when paused
           — except the small Paused-pill pulse so the user knows it's paused. */
        .tr-paused *:not(.tr-paused-indicator) {
          animation-play-state: paused !important;
        }
      `}</style>
    </>
  );
}
