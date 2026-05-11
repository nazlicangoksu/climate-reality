import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CREAM = '#f4efe6';
const INK = '#0d0d0d';
const RED = '#d4202c';
const PINK = '#ff2cb4';

type Frame =
  | { kind: 'text'; lines: string[]; bg: string; color: string; duration: number; size?: 'xl' | 'lg' | 'md' | 'sm'; cite?: string; serif?: boolean }
  | { kind: 'beat'; bg: string; duration: number }
  | { kind: 'cta'; bg: string; color: string };

const FRAMES: Frame[] = [
  // ─── COLD OPEN ───
  { kind: 'beat', bg: INK, duration: 700 },
  { kind: 'text', lines: ['Climate is no longer Top-3', 'on either side of the aisle.'], bg: INK, color: CREAM, duration: 2600, size: 'md' },
  { kind: 'text', lines: ["Half the country won't", 'say the word out loud.'], bg: INK, color: CREAM, duration: 2600, size: 'md' },
  { kind: 'beat', bg: INK, duration: 400 },
  { kind: 'text', lines: ["What's failing isn't the science."], bg: INK, color: CREAM, duration: 2000, size: 'md' },
  { kind: 'text', lines: ['It’s the lecture.'], bg: INK, color: PINK, duration: 2200, size: 'xl', serif: true },
  { kind: 'beat', bg: INK, duration: 500 },

  // ─── THE QUESTION ───
  { kind: 'text', lines: ['So we asked one question:'], bg: INK, color: CREAM, duration: 2000, size: 'md' },
  { kind: 'text', lines: ['What would it take', 'to reach the audience', 'the climate movement has lost?'], bg: INK, color: CREAM, duration: 3000, size: 'md', serif: true },
  { kind: 'beat', bg: INK, duration: 500 },
  { kind: 'text', lines: ['A literature review.', 'Stanford-faculty conversations.', 'One-on-one interviews.', 'Two group brainstorms.', 'Hollywood expert sessions.'], bg: INK, color: CREAM, duration: 3400, size: 'sm' },
  { kind: 'text', lines: ['One pattern.'], bg: INK, color: CREAM, duration: 1800, size: 'lg' },
  { kind: 'beat', bg: INK, duration: 400 },

  // ─── THE FINDINGS ───
  { kind: 'text', lines: ['More facts', 'deepen the fracture.'], bg: INK, color: CREAM, duration: 2200, size: 'md', cite: 'KAHAN · YALE' },
  { kind: 'text', lines: ['Stories', 'slip past the argument.'], bg: INK, color: CREAM, duration: 2200, size: 'md', cite: 'GREEN & BROCK' },
  { kind: 'text', lines: ['The cast', 'is the message.'], bg: INK, color: CREAM, duration: 2200, size: 'md', cite: 'GOLDBERG ET AL.' },
  { kind: 'text', lines: ['Common knowledge', 'requires watching together.'], bg: INK, color: CREAM, duration: 2400, size: 'md', cite: 'PALUCK & GREEN' },
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
  { kind: 'text', lines: ['The fires are in every window.', 'Nobody is allowed to say so.'], bg: PINK, color: INK, duration: 2800, size: 'md', serif: true },
  { kind: 'beat', bg: INK, duration: 700 },

  // ─── CLOSE ───
  { kind: 'text', lines: ['The climate movement', 'has a storytelling problem.'], bg: INK, color: CREAM, duration: 2600, size: 'lg' },
  { kind: 'text', lines: ['Reality TV', 'could fix it.'], bg: INK, color: PINK, duration: 2800, size: 'xl', serif: true },

  // ─── CTA ───
  { kind: 'cta', bg: INK, color: CREAM },
];

const AUTO_REDIRECT_MS = 5000;

export default function Trailer() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [countdown, setCountdown] = useState(Math.ceil(AUTO_REDIRECT_MS / 1000));

  useEffect(() => {
    document.title = 'The climate movement has a storytelling problem.';
  }, []);

  useEffect(() => {
    const frame = FRAMES[i];
    if (frame.kind === 'cta') return;
    const t = setTimeout(() => setI((x) => Math.min(x + 1, FRAMES.length - 1)), frame.duration);
    return () => clearTimeout(t);
  }, [i]);

  // Auto-redirect on CTA frame
  useEffect(() => {
    if (FRAMES[i].kind !== 'cta') return;
    const start = Date.now();
    const tick = setInterval(() => {
      const remaining = Math.max(0, AUTO_REDIRECT_MS - (Date.now() - start));
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        clearInterval(tick);
        navigate('/paper');
      }
    }, 100);
    return () => clearInterval(tick);
  }, [i, navigate]);

  function skip() { navigate('/paper'); }
  function restart() { setI(0); setCountdown(Math.ceil(AUTO_REDIRECT_MS / 1000)); }

  const f = FRAMES[i];
  const isSerif = f.kind === 'text' && f.serif === true;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          position: 'fixed', inset: 0,
          background: f.bg, color: 'color' in f ? f.color : CREAM,
          transition: 'background 0.6s ease, color 0.6s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px', overflow: 'hidden',
          cursor: f.kind === 'cta' ? 'default' : 'pointer',
        }}
        onClick={() => f.kind !== 'cta' && setI((x) => Math.min(x + 1, FRAMES.length - 1))}
      >
        {f.kind === 'text' && (
          <div key={i} style={{ maxWidth: 1100, textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {f.lines.map((line, j) => (
              <p
                key={j}
                style={{
                  fontFamily: isSerif ? "'Fraunces', Georgia, serif" : "'Archivo', system-ui, sans-serif",
                  fontStyle: isSerif ? 'italic' : 'normal',
                  fontWeight: isSerif ? 600 : f.size === 'xl' ? 900 : 800,
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
            {f.cite && (
              <p style={{
                marginTop: 28,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, letterSpacing: '0.28em', opacity: 0.55,
              }}>{f.cite}</p>
            )}
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

        {/* Skip + progress */}
        {f.kind !== 'cta' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); skip(); }}
              style={{
                position: 'absolute', bottom: 24, right: 24,
                background: 'transparent', border: `1px solid rgba(244,239,230,0.3)`,
                color: 'rgba(244,239,230,0.85)',
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}
            >Skip to research →</button>
            {/* Progress dots */}
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
          </>
        )}
      </div>
      <style>{`
        @keyframes tr-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
