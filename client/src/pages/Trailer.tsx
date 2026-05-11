import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CREAM = '#f4efe6';
const INK = '#0d0d0d';
const RED = '#d4202c';
const PINK = '#ff2cb4';

type Frame =
  | { kind: 'text'; lines: string[]; bg: string; color: string; emphasis?: string; duration: number; size?: 'xl' | 'lg' | 'md' }
  | { kind: 'beat'; bg: string; duration: number }
  | { kind: 'cta'; bg: string; color: string };

const FRAMES: Frame[] = [
  { kind: 'beat', bg: INK, duration: 800 },
  { kind: 'text', lines: ['The climate movement'], bg: INK, color: CREAM, duration: 2200, size: 'lg' },
  { kind: 'text', lines: ['has a storytelling problem.'], bg: INK, color: CREAM, duration: 2400, size: 'lg' },
  { kind: 'beat', bg: RED, duration: 600 },
  { kind: 'text', lines: ['CROSSFIRE.'], bg: RED, color: CREAM, duration: 2000, size: 'xl' },
  { kind: 'text', lines: ['Six households.', 'Same last names.'], bg: RED, color: CREAM, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['Climate at the family table.'], bg: RED, color: CREAM, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['No narrator.', 'No confessionals.', 'Just dinner.'], bg: RED, color: CREAM, duration: 2800, size: 'md' },
  { kind: 'beat', bg: PINK, duration: 600 },
  { kind: 'text', lines: ['ONE LAST THING.'], bg: PINK, color: INK, duration: 2000, size: 'xl' },
  { kind: 'text', lines: ['Sixteen strangers.', 'Post-fire LA.'], bg: PINK, color: INK, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['No politics.', 'No professions.'], bg: PINK, color: INK, duration: 2400, size: 'lg' },
  { kind: 'text', lines: ['The fires are in every window.', 'Nobody is allowed to say so.'], bg: PINK, color: INK, duration: 2800, size: 'md' },
  { kind: 'beat', bg: INK, duration: 700 },
  { kind: 'text', lines: ['Reality TV', 'could fix it.'], bg: INK, color: CREAM, duration: 2800, size: 'xl' },
  { kind: 'cta', bg: INK, color: CREAM },
];

export default function Trailer() {
  const [i, setI] = useState(0);

  useEffect(() => {
    document.title = 'Trailer — The climate movement has a storytelling problem';
    const frame = FRAMES[i];
    if (frame.kind === 'cta') return;
    const t = setTimeout(() => setI((x) => Math.min(x + 1, FRAMES.length - 1)), frame.duration);
    return () => clearTimeout(t);
  }, [i]);

  function skip() { setI(FRAMES.length - 1); }
  function restart() { setI(0); }

  const f = FRAMES[i];

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
          transition: 'background 0.6s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px', overflow: 'hidden',
        }}
        onClick={() => f.kind !== 'cta' && setI((x) => Math.min(x + 1, FRAMES.length - 1))}
      >
        {f.kind === 'text' && (
          <div key={i} style={{ maxWidth: 1100, textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            {f.lines.map((line, j) => (
              <p
                key={j}
                style={{
                  fontFamily: f.size === 'xl' ? "'Archivo', system-ui, sans-serif" : "'Archivo', system-ui, sans-serif",
                  fontWeight: f.size === 'xl' ? 900 : 800,
                  fontSize: f.size === 'xl' ? 'clamp(64px, 11vw, 140px)' : f.size === 'lg' ? 'clamp(40px, 7vw, 84px)' : 'clamp(28px, 5vw, 56px)',
                  lineHeight: 1.02,
                  letterSpacing: f.size === 'xl' ? '-0.04em' : '-0.025em',
                  margin: j === 0 ? '0' : '12px 0 0',
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {f.kind === 'cta' && (
          <div key="cta" style={{ textAlign: 'center', animation: 'tr-in 700ms ease' }}>
            <p
              style={{
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(44px, 7.5vw, 88px)',
                lineHeight: 1.02,
                letterSpacing: '-0.025em',
                margin: 0,
                color: CREAM,
              }}
            >
              The climate movement has a storytelling problem.
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: 'clamp(36px, 6vw, 76px)',
                lineHeight: 1.02,
                color: PINK,
                margin: '20px 0 56px',
              }}
            >
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
              >Read the research →</Link>
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
          </div>
        )}

        {/* Skip + sound + progress */}
        {f.kind !== 'cta' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); skip(); }}
              style={{
                position: 'absolute', bottom: 24, right: 24,
                background: 'transparent', border: `1px solid rgba(244,239,230,0.3)`,
                color: 'rgba(244,239,230,0.8)',
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}
            >Skip →</button>
            <Link
              to="/paper"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 24, left: 24,
                color: 'rgba(244,239,230,0.6)', textDecoration: 'none',
                fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}
            >← Back</Link>
            {/* Progress dots */}
            <div style={{
              position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6,
            }}>
              {FRAMES.map((_, idx) => (
                <span key={idx} style={{
                  width: idx === i ? 24 : 8, height: 4, borderRadius: 2,
                  background: idx <= i ? 'rgba(244,239,230,0.9)' : 'rgba(244,239,230,0.18)',
                  transition: 'width 0.4s, background 0.4s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes tr-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
