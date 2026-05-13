import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CREAM = '#f4efe6';
const INK = '#0d0d0d';
const RED = '#d4202c';
const PINK = '#ff2cb4';

type Frame =
  | { kind: 'text'; lines: string[]; bg: string; color: string; duration: number; size?: 'xl' | 'lg' | 'md' | 'sm'; serif?: boolean }
  | { kind: 'beat'; bg: string; duration: number }
  | { kind: 'question'; badge: string; question: string; highlight: string; bg: string; color: string; duration: number }
  | { kind: 'finding'; index: number; total: number; finding: string; detail?: string; citation: string; journal: string; bg: string; color: string; duration: number }
  | { kind: 'showcard'; index: number; total: number; title: string; genre: string; premise: string; bg: string; color: string; accent: string; duration: number }
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
    finding: 'A year-long field experiment in post-genocide Rwanda. Groups listened monthly to a radio soap opera about reconciliation. Group norms shifted — who it was okay to marry, when to speak up, how to settle a fight. Personal attitudes barely moved.',
    detail: "A decade later in Uganda: short anti-violence videos cut reported domestic violence by roughly a quarter when watched in groups — and produced nothing measurable when watched alone on tablets.",
    citation: 'PALUCK & GREEN (2009) · GREEN, WILKE & COOPER (2020)',
    journal: 'AMERICAN POLITICAL SCIENCE REVIEW · COMPARATIVE POLITICAL STUDIES',
    bg: INK, color: CREAM, duration: 11000,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── THE BET ───
  { kind: 'text', lines: ['So we built two shows.'], bg: INK, color: CREAM, duration: 2000, size: 'lg' },
  { kind: 'text', lines: ['Same research.', 'Two different doors.'], bg: INK, color: CREAM, duration: 2200, size: 'md' },
  { kind: 'beat', bg: RED, duration: 600 },

  // ─── CROSSFIRE ───
  {
    kind: 'showcard', index: 1, total: 2,
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
    line1: 'Reality TV that turns climate into a family conversation again.',
    line2: 'Six families do it on screen so the rest of America can do it off it.',
    sub: 'Common knowledge is the lever. — Paluck & Green',
    bg: RED, color: CREAM, accent: CREAM, duration: 7500,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── ONE LAST THING ───
  { kind: 'beat', bg: PINK, duration: 500 },
  {
    kind: 'showcard', index: 2, total: 2,
    title: 'ONE LAST THING.',
    genre: 'Unscripted dating series · 10 episodes',
    premise: 'Sixteen strangers fall in love in post-fire LA, with two rules they cannot break.',
    bg: PINK, color: INK, accent: INK, duration: 6000,
  },
  { kind: 'text', lines: ['One glass house above Altadena.', 'A 14,000-acre burn scar in every window.'], bg: PINK, color: INK, duration: 3400, size: 'md' },
  { kind: 'text', lines: ['Two rules.', "They can't reveal their politics", 'or their profession.'], bg: PINK, color: INK, duration: 3600, size: 'md' },
  { kind: 'text', lines: ['They date for ten weeks', 'through the 36 Questions.'], bg: PINK, color: INK, duration: 3000, size: 'md' },
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
    b: "I’m a climate organizer. My dad just lost his job to it.",
    bg: PINK, color: INK, duration: 6200,
  },
  {
    kind: 'couple', index: 3, total: 3,
    a: "I’m a coal miner’s daughter. I’m voting blue this November.",
    b: "I’m a Brooklyn vegan. I drive a pickup truck.",
    bg: PINK, color: INK, duration: 6200,
  },
  { kind: 'text', lines: ['They already chose each other.', 'Now they find out who.'], bg: PINK, color: INK, duration: 3400, size: 'lg', serif: true },
  { kind: 'text', lines: ['Then they walk the aisle.', 'Yes or no.'], bg: PINK, color: INK, duration: 3000, size: 'md' },
  {
    kind: 'takeaway',
    badge: 'ONE LAST THING · THE SO-WHAT',
    line1: 'Reality dating that hides politics until love is on the line.',
    line2: 'Sixteen strangers. One last thing. America watching to see if love wins.',
    sub: 'Identity-protective cognition, bypassed by attraction. — Kahan',
    bg: PINK, color: INK, accent: INK, duration: 7500,
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
  function restart() {
    setI(0);
    setCountdown(Math.ceil(AUTO_REDIRECT_MS / 1000));
    setPaused(false);
  }

  const f = FRAMES[i];
  const isSerifText = f.kind === 'text' && f.serif === true;

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

        {f.kind === 'question' && (
          <div key={i} style={{ maxWidth: 1100, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {/* Centered badge with rules on both sides */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, opacity: 0.7 }}>
              <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.25 }}/>
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: PINK, display: 'inline-block',
                animation: 'tr-pulse 1.6s ease-in-out infinite',
              }}/>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.3em',
                whiteSpace: 'nowrap',
              }}>{f.badge}</span>
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: PINK, display: 'inline-block',
                animation: 'tr-pulse 1.6s ease-in-out infinite',
              }}/>
              <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.25 }}/>
            </div>

            {/* The question — centered, no decorative giant quote */}
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(28px, 4.6vw, 60px)',
              lineHeight: 1.22,
              letterSpacing: '-0.012em',
              margin: '0 auto',
              maxWidth: 980,
            }}>
              <HighlightSweep text={f.question} highlight={f.highlight}/>
            </p>

            {/* Bottom centered signature */}
            <div style={{
              marginTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, opacity: 0.5,
            }}>
              <span style={{ width: 36, height: 1, background: 'currentColor' }}/>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 10, letterSpacing: '0.3em',
              }}>STANFORD GSB · GEN 390 · 2026</span>
              <span style={{ width: 36, height: 1, background: 'currentColor' }}/>
            </div>
          </div>
        )}

        {f.kind === 'finding' && (
          <div key={i} style={{ maxWidth: 1180, width: '100%', animation: 'tr-in 700ms ease' }}>
            {/* Top badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36, opacity: 0.75 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.3em',
                background: PINK, color: INK,
                padding: '4px 10px', borderRadius: 4,
              }}>FINDING {String(f.index).padStart(2, '0')} / {String(f.total).padStart(2, '0')}</span>
              <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.25 }}/>
            </div>

            {/* Big finding */}
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 400,
              fontSize: 'clamp(26px, 4vw, 56px)',
              lineHeight: 1.18,
              letterSpacing: '-0.012em',
              margin: 0,
            }}>{f.finding}</p>

            {f.detail && (
              <p style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontSize: 'clamp(16px, 2.2vw, 26px)',
                lineHeight: 1.45,
                opacity: 0.75,
                marginTop: 28,
                marginBottom: 0,
                fontWeight: 400,
              }}>{f.detail}</p>
            )}

            {/* Citation block */}
            <div style={{
              marginTop: 56, paddingTop: 22,
              borderTop: `2px solid ${PINK}`,
            }}>
              <p style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 800, fontSize: 'clamp(13px, 1.5vw, 16px)',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: PINK, margin: 0,
              }}>{f.citation}</p>
              <p style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.22em',
                opacity: 0.55, marginTop: 6, marginBottom: 0,
              }}>{f.journal}</p>
            </div>
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

            {/* Ampersand ornament */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 14, margin: '32px auto',
              maxWidth: 260,
            }}>
              <span style={{ flex: 1, height: 1, background: f.accent, opacity: 0.5 }}/>
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 28,
                color: f.accent,
                fontWeight: 400,
              }}>&amp;</span>
              <span style={{ flex: 1, height: 1, background: f.accent, opacity: 0.5 }}/>
            </div>

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
          <div key={i} style={{ maxWidth: 1180, width: '100%', textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 56, opacity: 0.85, justifyContent: 'center' }}>
              <span style={{ width: 36, height: 1, background: f.accent }}/>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
                background: f.accent, color: f.bg,
                padding: '5px 12px', borderRadius: 4, fontWeight: 700,
              }}>{f.badge}</span>
              <span style={{ width: 36, height: 1, background: f.accent }}/>
            </div>

            {/* Big lines */}
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(30px, 4.6vw, 64px)',
              lineHeight: 1.18,
              letterSpacing: '-0.012em',
              margin: '0 auto',
              maxWidth: 1000,
            }}>{f.line1}</p>

            <p style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4.4vw, 60px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '14px auto 0',
              maxWidth: 1000,
            }}>{f.line2}</p>

            {/* Optional sub */}
            {f.sub && (
              <div style={{
                marginTop: 56, paddingTop: 22,
                borderTop: `2px solid ${f.accent}`,
                maxWidth: 720, marginLeft: 'auto', marginRight: 'auto',
              }}>
                <p style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 12, letterSpacing: '0.22em',
                  opacity: 0.8, margin: 0,
                }}>{f.sub}</p>
              </div>
            )}
          </div>
        )}

        {f.kind === 'showcard' && (
          <div key={i} style={{ maxWidth: 1180, width: '100%', animation: 'tr-in 700ms ease', position: 'relative' }}>
            {/* Top: SHOW NN / NN badge with rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.3em',
                background: f.accent, color: f.bg,
                padding: '4px 10px', borderRadius: 4, fontWeight: 700,
              }}>SHOW {String(f.index).padStart(2, '0')} / {String(f.total).padStart(2, '0')}</span>
              <span style={{ flex: 1, height: 1, background: f.accent, opacity: 0.35 }}/>
              <span style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.3em', opacity: 0.55,
              }}>{f.genre}</span>
            </div>

            {/* Big title */}
            <p style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(72px, 13vw, 168px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              margin: '0 0 28px',
            }}>{f.title}</p>

            {/* Accent rule */}
            <div style={{
              width: 96, height: 4, background: f.accent, marginBottom: 28,
            }}/>

            {/* Premise */}
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(22px, 3.4vw, 44px)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              margin: 0,
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
                border: `1px solid ${paused ? PINK : 'rgba(244,239,230,0.3)'}`,
                color: paused ? PINK : 'rgba(244,239,230,0.85)',
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
                background: 'transparent', border: `1px solid rgba(244,239,230,0.3)`,
                color: 'rgba(244,239,230,0.85)',
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                zIndex: 10,
              }}
            >Skip to research →</button>
            <div style={{
              position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {FRAMES.map((_, idx) => (
                <span key={idx} style={{
                  width: idx === i ? 18 : 5, height: 4, borderRadius: 2,
                  background: idx <= i ? 'rgba(244,239,230,0.85)' : 'rgba(244,239,230,0.18)',
                  transition: 'width 0.4s, background 0.4s',
                }} />
              ))}
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
