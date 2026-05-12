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
    bg: INK, color: CREAM, duration: 6200,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── PROCESS ───
  { kind: 'text', lines: ['Sixteen academic papers.', 'Twenty-plus interviews.', 'Two group brainstorms.', 'Hollywood expert sessions.'], bg: INK, color: CREAM, duration: 3000, size: 'sm' },
  { kind: 'text', lines: ['Four findings', 'kept coming back.'], bg: INK, color: CREAM, duration: 2200, size: 'lg' },
  { kind: 'beat', bg: INK, duration: 400 },

  // ─── THE FOUR FINDINGS ───
  {
    kind: 'finding', index: 1, total: 4,
    finding: 'The more scientifically literate a Republican becomes, the more skeptical of climate science they tend to be — and the same effect runs in reverse for Democrats.',
    detail: "Climate isn't a literacy problem. It's an identity one. More facts deepen the fracture; they don't close it.",
    citation: 'KAHAN, D.M. (2015)',
    journal: 'YALE · CULTURAL COGNITION PROJECT · POLITICAL PSYCHOLOGY 36',
    bg: INK, color: CREAM, duration: 6200,
  },
  {
    kind: 'finding', index: 2, total: 4,
    finding: 'Audiences absorbed in a narrative drop the counterarguing reflex and adopt story-consistent beliefs.',
    detail: "The argument can't get through the defenses. The story can.",
    citation: 'GREEN, M.C. & BROCK, T.C. (2000)',
    journal: 'PENN · JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY',
    bg: INK, color: CREAM, duration: 5800,
  },
  {
    kind: 'finding', index: 3, total: 4,
    finding: 'Climate ads featuring surprising messengers moved Republican voters seven points on belief and ten on human cause.',
    detail: 'A former Republican congressman. An Air Force general. An evangelical climate scientist. Sunstein calls these figures surprising validators — and the audience cannot dismiss them as the other team.',
    citation: 'GOLDBERG, GUSTAFSON, MAIBACH & LEISEROWITZ (2021)',
    journal: 'NATURE CLIMATE CHANGE · VOL. 11',
    bg: INK, color: CREAM, duration: 7000,
  },
  {
    kind: 'finding', index: 4, total: 4,
    finding: 'In Rwanda, a soap opera about reconciliation barely moved personal attitudes — but shifted group norms when people listened together.',
    detail: "In Uganda, the same effect, sharper: short videos cut reported domestic violence by roughly a quarter when watched communally — and produced nothing measurable when watched alone on tablets.",
    citation: 'PALUCK & GREEN (2009) · GREEN, WILKE & COOPER (2020)',
    journal: 'AMERICAN POLITICAL SCIENCE REVIEW · COMPARATIVE POLITICAL STUDIES',
    bg: INK, color: CREAM, duration: 7000,
  },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── THE BET ───
  { kind: 'text', lines: ['So we built two shows.'], bg: INK, color: CREAM, duration: 2000, size: 'lg' },
  { kind: 'text', lines: ['Same research.', 'Two different doors.'], bg: INK, color: CREAM, duration: 2200, size: 'md' },
  { kind: 'beat', bg: RED, duration: 600 },

  // ─── CROSSFIRE ───
  { kind: 'text', lines: ['CROSSFIRE.'], bg: RED, color: CREAM, duration: 2000, size: 'xl' },
  { kind: 'text', lines: ['Six American households.', 'Same last names.'], bg: RED, color: CREAM, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['A denier dad.', 'An activist daughter.'], bg: RED, color: CREAM, duration: 2200, size: 'md' },
  { kind: 'text', lines: ['A pastor.', 'A NOAA scientist.', 'They share a last name.'], bg: RED, color: CREAM, duration: 2400, size: 'md' },
  { kind: 'text', lines: ['Climate', 'at the family table.'], bg: RED, color: CREAM, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['No narrator.', 'No confessionals.', 'Just dinner.'], bg: RED, color: CREAM, duration: 2400, size: 'md' },
  { kind: 'beat', bg: INK, duration: 400 },

  // ─── ONE LAST THING ───
  { kind: 'beat', bg: PINK, duration: 500 },
  { kind: 'text', lines: ['ONE LAST THING.'], bg: PINK, color: INK, duration: 2000, size: 'xl' },
  { kind: 'text', lines: ['Sixteen strangers.', 'Post-fire LA.'], bg: PINK, color: INK, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['No politics.', 'No professions.'], bg: PINK, color: INK, duration: 2200, size: 'lg' },
  { kind: 'text', lines: ['Connect through', 'the 36 Questions.'], bg: PINK, color: INK, duration: 2200, size: 'md' },
  { kind: 'text', lines: ['Couple up.', 'Propose.', 'Reveal the one last thing.'], bg: PINK, color: INK, duration: 2600, size: 'md' },
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
