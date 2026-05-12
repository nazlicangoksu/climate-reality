import { useEffect, useState } from 'react';

const RED = '#d4202c';
const BLUE = '#1f2bd6';
const PINK = '#ff2cb4';
const CREAM = '#f4efe6';
const INK = '#0d0d0d';
const MUTED = '#4a4742';
const RULE = '#d8d2c4';

type Tab = 'paper' | 'process';

const SectionNum = ({ children, color = RED }: { children: React.ReactNode; color?: string }) => (
  <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 500, fontSize: 12, letterSpacing: '0.2em', color, display: 'block', marginBottom: 12, textTransform: 'uppercase' }}>
    {children}
  </span>
);

const H2 = ({ num, color = RED, children }: { num: string; color?: string; children: React.ReactNode }) => (
  <h2 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '80px 0 24px' }}>
    <SectionNum color={color}>{num}</SectionNum>
    {children}
  </h2>
);

const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1.2, margin: '48px 0 16px' }}>
    {children}
  </h3>
);

const Pull: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px, 3.2vw, 30px)', lineHeight: 1.3, margin: '56px 0', borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: '32px 0' }}>
    {children}
  </p>
);

const Highlight: React.FC<{ bg: string; fg?: string; children: React.ReactNode }> = ({ bg, fg = CREAM, children }) => (
  <span style={{ background: bg, color: fg, padding: '0 8px' }}>{children}</span>
);

const Figure: React.FC<{ src: string; n: string; caption: string }> = ({ src, n, caption }) => (
  <figure style={{ margin: '40px 0 48px' }}>
    <img src={src} alt="" style={{ display: 'block', maxWidth: '100%', height: 'auto', border: `1px solid ${RULE}`, borderRadius: 4 }} />
    <figcaption style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.04em', color: MUTED, marginTop: 12, lineHeight: 1.4 }}>
      <strong style={{ color: INK }}>{n}</strong> · {caption}
    </figcaption>
  </figure>
);

const Cite: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ color: BLUE, textDecoration: 'underline', textUnderlineOffset: 2 }}>{children}</a>
);

// ─── Concept Card with expandable detail ──────────────────────
type ConceptDetailProps = {
  accent: string;
  label: string;
  title: string;
  tag: string;
  short: React.ReactNode;
  interactive?: React.ReactNode;
  detail: {
    world: string;
    cast: { label: string; body: string }[];
    mechanics: { title: string; body: string }[];
    closing: string;
    edge?: { intro: string; rules: { title: string; body: string }[] };
  };
};

const ConceptCard: React.FC<ConceptDetailProps> = ({ accent, label, title, tag, short, interactive, detail }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${INK}`, borderLeft: `8px solid ${accent}`, padding: '32px 28px', margin: '32px 0', background: CREAM }}>
      <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, letterSpacing: '0.2em', color: MUTED }}>
        {label}
      </span>
      <h3 style={{ margin: '8px 0 12px', fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.1 }}>
        {title}
      </h3>
      <p style={{ fontStyle: 'italic', fontSize: 18, color: INK, marginBottom: 16, fontFamily: "'Fraunces', Georgia, serif" }}>
        {tag}
      </p>
      {short}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? INK : 'transparent',
          color: open ? CREAM : INK,
          border: `1px solid ${INK}`,
          padding: '10px 18px',
          fontFamily: "'Archivo', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          borderRadius: 999,
          marginTop: 8,
          transition: 'all 0.2s',
        }}
      >
        {open ? '— Collapse' : '+ See more detail'}
      </button>

      {open && (
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: `1px solid ${RULE}` }}>
          <h4 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>The world</h4>
          <p>{detail.world}</p>

          <h4 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginTop: 32, marginBottom: 12 }}>The cast (examples)</h4>
          {detail.cast.map((c, i) => (
            <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < detail.cast.length - 1 ? `1px solid ${RULE}` : 'none' }}>
              <p style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{c.label}</p>
              <p style={{ fontSize: 15, color: MUTED, marginBottom: 0 }}>{c.body}</p>
            </div>
          ))}

          <h4 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginTop: 32, marginBottom: 12 }}>The mechanics</h4>
          {detail.mechanics.map((m, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 17, marginBottom: 4 }}>{m.title}</p>
              <p style={{ fontSize: 15, color: MUTED, marginBottom: 0 }}>{m.body}</p>
            </div>
          ))}

          {detail.edge && (
            <>
              <h4 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginTop: 40, marginBottom: 12 }}>The edge — how we keep it out of CNN-doc territory</h4>
              <p style={{ marginBottom: 18 }}>{detail.edge.intro}</p>
              {detail.edge.rules.map((r, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 17, marginBottom: 4 }}>{r.title}</p>
                  <p style={{ fontSize: 15, color: MUTED, marginBottom: 0 }}>{r.body}</p>
                </div>
              ))}
            </>
          )}

          {interactive}

          <p style={{ marginTop: 32, fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 18, color: INK, paddingTop: 24, borderTop: `1px solid ${RULE}` }}>
            “{detail.closing}”
          </p>

          <div style={{ marginTop: 32, padding: '20px 24px', background: INK, color: CREAM, borderRadius: 4 }}>
            <p style={{ margin: 0, fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 13, lineHeight: 1.5 }}>
              <strong style={{ color: CREAM, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11 }}>Want the full pitch?</strong>
              <br />
              We have a detailed pitch deck for this show — episode arcs, cast architecture, tone references, and the production plan. Reach out at <a href="mailto:etzioni@stanford.edu" style={{ color: CREAM, textDecoration: 'underline' }}>etzioni@stanford.edu</a> or <a href="mailto:ngoksu@stanford.edu" style={{ color: CREAM, textDecoration: 'underline' }}>ngoksu@stanford.edu</a> if you'd like to see it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab nav ──────────────────────
const TabBar: React.FC<{ tab: Tab; setTab: (t: Tab) => void }> = ({ tab, setTab }) => (
  <div style={{
    position: 'sticky',
    top: 0,
    background: CREAM,
    zIndex: 10,
    borderBottom: `1px solid ${RULE}`,
    margin: '0 -24px 48px',
    padding: '0 24px',
  }}>
    <div style={{ display: 'flex', gap: 0, maxWidth: 760, margin: '0 auto' }}>
      {(['paper', 'process'] as Tab[]).map(t => (
        <button
          key={t}
          onClick={() => { setTab(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: tab === t ? `2px solid ${INK}` : '2px solid transparent',
            padding: '18px 0',
            marginRight: 32,
            fontFamily: "'Archivo', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: tab === t ? INK : MUTED,
            cursor: 'pointer',
          }}
        >
          {t === 'paper' ? 'The Research' : 'The Process'}
        </button>
      ))}
    </div>
  </div>
);

// ─── CROSSFIRE quiz ──────────────────────
type Household = 'lansing' | 'permian' | 'cheyenne' | 'tulsa' | 'houma' | 'morgantown' | 'phoenix';

const HOUSEHOLDS: Record<Household, { name: string; location: string; description: string }> = {
  lansing: {
    name: 'The Argument',
    location: 'Lansing, MI',
    description: "A father who's called climate change a hoax since 2010 and the daughter who came home from her first year of college a climate organizer. They love each other. They haven't gotten through a Thanksgiving without one of them leaving the table since 2024.",
  },
  permian: {
    name: 'Rig & Vote',
    location: 'Permian Basin, TX',
    description: "A husband who works the rigs married to a wife who organizes for the Sierra Club on Tuesdays. He pays the mortgage with oil. They've been married twenty-one years.",
  },
  cheyenne: {
    name: 'The Land',
    location: 'Cheyenne, WY',
    description: "A fourth-generation cattle rancher and the son who came home from grad school to convert the operation to regenerative grazing. The father loves the boy. The boy loves the land. They argue about both.",
  },
  tulsa: {
    name: 'Sermon & Data',
    location: 'Tulsa, OK',
    description: "A Pentecostal pastor whose only daughter is a NOAA climate scientist. Sunday morning he preaches dominion. Sunday afternoon she shows him the model. Both believe they're doing right by the same God.",
  },
  houma: {
    name: 'Water Line',
    location: 'Houma, LA',
    description: "A Cajun shrimper who's lost two boats to storms, the wife who manages the parish flood-insurance office, and a grandmother who won't move inland.",
  },
  morgantown: {
    name: 'Coal & Code',
    location: 'Morgantown, WV',
    description: "A laid-off coal foreman, his nurse wife, and the grandson who got a remote job at a clean-energy startup.",
  },
  phoenix: {
    name: 'The Heat',
    location: 'Phoenix, AZ',
    description: "A cop, an HVAC contractor, and the abuela who survived three 115° summers without AC. The family does not agree on the word for what's happening.",
  },
};

const QUIZ: { q: string; options: { label: string; score: Partial<Record<Household, number>> }[] }[] = [
  {
    q: "How does climate show up in your family conversation?",
    options: [
      { label: "We fight about it. Loudly. Usually at Thanksgiving.", score: { lansing: 2, permian: 1 } },
      { label: "We don't talk about it. Anymore.", score: { permian: 2, houma: 1 } },
      { label: "The land and the work made us talk about it.", score: { cheyenne: 2, morgantown: 1 } },
      { label: "Faith and science don't line up at our table.", score: { tulsa: 2 } },
      { label: "The water came up. The heat won't quit. We had to talk.", score: { houma: 2, phoenix: 2 } },
    ],
  },
  {
    q: "Who's the loudest at your family dinner?",
    options: [
      { label: "Dad. Always Dad.", score: { lansing: 2, permian: 1, cheyenne: 1 } },
      { label: "The grandkid trying to explain something.", score: { morgantown: 2, tulsa: 1 } },
      { label: "Abuela / grandma. Quiet but loudest.", score: { phoenix: 2, houma: 1 } },
      { label: "The pastor at the head of the table.", score: { tulsa: 2 } },
      { label: "Nobody. We've stopped talking about it.", score: { permian: 1, houma: 1 } },
    ],
  },
  {
    q: "What's your family's money tied to?",
    options: [
      { label: "Oil, gas, the rig.", score: { permian: 2 } },
      { label: "The land. The herd. The seasons.", score: { cheyenne: 2 } },
      { label: "Coal, manufacturing, the old plant.", score: { morgantown: 2 } },
      { label: "The boat. The catch. The water.", score: { houma: 2 } },
      { label: "Service work — cop, HVAC, contractor.", score: { phoenix: 2 } },
      { label: "The church. Public service. Teaching.", score: { tulsa: 2 } },
      { label: "Honestly, we're not sure anymore.", score: { lansing: 2, morgantown: 1 } },
    ],
  },
  {
    q: "What's the weather doing to your hometown?",
    options: [
      { label: "Wells running low. Drought won't end.", score: { permian: 2, cheyenne: 1 } },
      { label: "Calving season later every year.", score: { cheyenne: 2 } },
      { label: "Hurricanes that keep getting worse.", score: { houma: 2 } },
      { label: "Summers so hot we bury neighbors.", score: { phoenix: 2 } },
      { label: "The mine closed. The town emptied.", score: { morgantown: 2 } },
      { label: "Mostly fine. It's just my dad on Facebook.", score: { lansing: 2 } },
      { label: "The pastor mentioned the drought map last Sunday.", score: { tulsa: 2 } },
    ],
  },
  {
    q: "What's the table tension actually about?",
    options: [
      { label: "Generations. The kid came home different.", score: { lansing: 2, tulsa: 1, cheyenne: 1 } },
      { label: "Marriage. He votes one way, she votes the other.", score: { permian: 2 } },
      { label: "Whether to stay or whether to move.", score: { houma: 2 } },
      { label: "Old job vs. new job.", score: { morgantown: 2 } },
      { label: "Three generations, two languages, one room.", score: { phoenix: 2 } },
      { label: "Faith on one side, data on the other.", score: { tulsa: 2 } },
    ],
  },
  {
    q: "What's the one thing your family won't give up?",
    options: [
      { label: "The truck.", score: { permian: 2 } },
      { label: "The land.", score: { cheyenne: 2 } },
      { label: "The faith.", score: { tulsa: 2 } },
      { label: "The home — even if it floods again.", score: { houma: 2 } },
      { label: "The trade. The craft. The know-how.", score: { morgantown: 2 } },
      { label: "The neighborhood, the abuela, the recipes.", score: { phoenix: 2 } },
      { label: "The dinner table. Even when nobody's talking.", score: { lansing: 2 } },
    ],
  },
];

function CrossfireQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Household, number>>({
    lansing: 0, permian: 0, cheyenne: 0, tulsa: 0, houma: 0, morgantown: 0, phoenix: 0,
  });
  const [done, setDone] = useState(false);

  function pick(option: { label: string; score: Partial<Record<Household, number>> }) {
    const next = { ...scores };
    for (const k of Object.keys(option.score) as Household[]) {
      next[k] += option.score[k] || 0;
    }
    setScores(next);
    if (step + 1 >= QUIZ.length) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  }

  function reset() {
    setScores({ lansing: 0, permian: 0, cheyenne: 0, tulsa: 0, houma: 0, morgantown: 0, phoenix: 0 });
    setStep(0);
    setDone(false);
  }

  const top = (Object.entries(scores) as [Household, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'lansing';
  const result = HOUSEHOLDS[top];

  return (
    <div style={{
      marginTop: 40, padding: '28px 24px', border: `2px solid ${RED}`,
      background: 'rgba(212,32,44,0.04)', borderRadius: 4,
    }}>
      <h4 style={{
        fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: RED,
        marginTop: 0, marginBottom: 8,
      }}>Which CROSSFIRE household are you in?</h4>
      <p style={{ marginTop: 0, fontSize: 14, color: MUTED }}>
        Six questions. We'll tell you which family you'd be filmed inside.
      </p>

      {!done ? (
        <div style={{ marginTop: 20 }}>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
            fontSize: 18, marginBottom: 16,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11,
              letterSpacing: '0.2em', color: MUTED, marginRight: 8,
            }}>
              {String(step + 1).padStart(2, '0')} / {String(QUIZ.length).padStart(2, '0')}
            </span>
            {QUIZ[step].q}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUIZ[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => pick(opt)}
                style={{
                  textAlign: 'left', padding: '12px 16px',
                  background: 'transparent', border: `1px solid ${RULE}`,
                  borderRadius: 4, cursor: 'pointer',
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 15,
                  color: INK, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,32,44,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = RED; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = RULE; }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          <p style={{
            fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800,
            fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: RED, marginBottom: 8,
          }}>You'd be in</p>
          <p style={{
            fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 900,
            fontSize: 32, lineHeight: 1.1, margin: '0 0 6px',
          }}>
            {result.location} — {result.name}.
          </p>
          <p style={{ fontSize: 16, color: MUTED, marginBottom: 24 }}>
            {result.description}
          </p>
          <button
            onClick={reset}
            style={{
              background: 'transparent', border: `1px solid ${INK}`,
              padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
              fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800,
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: INK,
            }}
          >Take it again</button>
        </div>
      )}
    </div>
  );
}

// ─── ONE LAST THING wall ──────────────────────
const OLT_PROMPTS = [
  "What's the climate truth you don't lead with?",
  "What's the climate thing you can't say to your family?",
  "What's the climate hypocrisy you live with?",
  "What's the climate moment that changed you?",
  "What's the climate belief you keep at the door?",
];

type Submission = { text: string; ts: number };

function OneLastThingWall() {
  const [prompt] = useState(() => OLT_PROMPTS[Math.floor(Math.random() * OLT_PROMPTS.length)]);
  const [text, setText] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [yourTs, setYourTs] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/one-last-thing').then(r => r.json()).then(d => {
      if (Array.isArray(d?.submissions)) setSubmissions(d.submissions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function submit() {
    const v = text.trim();
    if (!v || v.length > 280) return;
    const ts = Date.now();
    try {
      await fetch('/api/one-last-thing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: v }),
      });
      setSubmissions(prev => [{ text: v, ts }, ...prev]);
      setYourTs(ts);
      setText('');
      setSubmitted(true);
      // Scroll the wall into view shortly after the DOM updates
      setTimeout(() => {
        const el = document.getElementById('olt-wall');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch {
      // fail silently
    }
  }

  return (
    <div style={{
      marginTop: 40, padding: '28px 24px', border: `2px solid ${PINK}`,
      background: 'rgba(255,44,180,0.04)', borderRadius: 4,
    }}>
      <h4 style={{
        fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 12,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: PINK,
        marginTop: 0, marginBottom: 8,
      }}>Your one last thing.</h4>
      <p style={{ marginTop: 0, fontSize: 14, color: MUTED }}>
        Imagine the villa. No politics. No professions. Type your truth — it lands on the wall below, anonymized.
      </p>

      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
        fontSize: 22, lineHeight: 1.3, margin: '24px 0 16px',
      }}>
        {prompt}
      </p>

      {!submitted ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            placeholder="Type it here. Nobody will know it was you."
            style={{
              width: '100%', minHeight: 100, padding: 14,
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
              border: `1px solid ${RULE}`, borderRadius: 4, resize: 'vertical',
              background: CREAM, color: INK, outline: 'none', lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Archivo', system-ui, sans-serif", letterSpacing: '0.1em' }}>
              {text.length} / 280
            </span>
            <button
              onClick={submit}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? INK : 'transparent', color: text.trim() ? CREAM : MUTED,
                border: `1px solid ${INK}`, padding: '10px 18px', borderRadius: 999,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 800,
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              }}
            >Add to the wall →</button>
          </div>
        </>
      ) : (
        <div style={{
          padding: '14px 18px', background: PINK, color: INK, borderRadius: 4,
          fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <span>Your truth is on the wall. ↓ It's the highlighted one below.</span>
        </div>
      )}

      <div id="olt-wall" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${RULE}` }}>
        <p style={{
          fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, margin: '0 0 12px',
        }}>
          {loading ? 'Loading the wall …' : `The wall — ${submissions.length} truth${submissions.length === 1 ? '' : 's'}`}
        </p>
        {!loading && submissions.length === 0 && (
          <p style={{ fontSize: 14, color: MUTED, fontStyle: 'italic' }}>
            No truths on the wall yet. Yours could be the first.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 6 }}>
          {submissions.map((s, i) => {
            const isYours = s.ts === yourTs;
            return (
              <div
                key={`${s.ts}-${i}`}
                style={{
                  padding: '14px 16px',
                  background: isYours ? PINK : CREAM,
                  color: isYours ? INK : INK,
                  border: `1px solid ${isYours ? INK : RULE}`,
                  borderRadius: 4,
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 16, lineHeight: 1.45,
                  fontStyle: 'italic',
                  fontWeight: isYours ? 600 : 400,
                  position: 'relative',
                  boxShadow: isYours ? `0 0 0 3px rgba(255,44,180,0.25)` : 'none',
                }}
              >
                {isYours && (
                  <span style={{
                    position: 'absolute', top: -10, left: 12, background: INK, color: CREAM,
                    fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 9,
                    letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800,
                    padding: '3px 8px', borderRadius: 999, fontStyle: 'normal',
                  }}>Yours</span>
                )}
                "{s.text}"
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────
export default function Paper() {
  const [tab, setTab] = useState<Tab>('paper');

  useEffect(() => {
    document.title = 'The climate movement has a storytelling problem — GEN 390';
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .paper-root { background: ${CREAM}; color: ${INK}; min-height: 100vh; font-family: 'Fraunces', Georgia, serif; font-size: 17px; line-height: 1.6; }
        .paper-root p { margin: 0 0 22px; }
        .paper-root strong { font-weight: 600; color: ${INK}; }
        .paper-root em { font-style: italic; }
        .paper-root a { color: ${BLUE}; text-decoration: underline; text-underline-offset: 2px; }
        .paper-root ul, .paper-root ol { margin: 0 0 24px; padding-left: 24px; }
        .paper-root li { margin-bottom: 10px; }
        .paper-root hr { border: 0; border-top: 1px solid ${RULE}; margin: 80px 0; }
        .paper-root table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 14px; font-family: 'Archivo', system-ui, sans-serif; }
        .paper-root th, .paper-root td { text-align: left; padding: 12px 14px; border-bottom: 1px solid ${RULE}; vertical-align: top; }
        .paper-root th { font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-size: 11px; color: ${INK}; border-bottom: 2px solid ${INK}; }
        .paper-root td { color: ${MUTED}; }
        .paper-root td strong { color: ${INK}; font-weight: 600; }
        .paper-page { max-width: 760px; margin: 0 auto; padding: 48px 24px 96px; }
        @media (min-width: 720px) { .paper-page { padding: 64px 48px 120px; } }
        .meta { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; font-size: 11px; }
        .topbar { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .figrow { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 40px 0 48px; }
        @media (min-width: 720px) { .figrow { grid-template-columns: 1fr 1fr; } }
        .figrow figure { margin: 0; }
        .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 8px; vertical-align: middle; }
        .download {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 600; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: ${CREAM}; background: ${INK}; padding: 10px 16px; border-radius: 999px;
          text-decoration: none !important; transition: opacity 0.2s;
        }
        .download:hover { opacity: 0.85; }
      `}</style>

      <div className="paper-root">
        <div className="paper-page">
          <div className="topbar">
            <span className="meta">GSB GEN 390 · Independent Research · 2026</span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="download" href="/trailer" style={{ background: 'transparent', color: INK, border: `1px solid ${INK}` }}>▶ Watch the trailer</a>
              <a className="download" href="/paper/Climate-Above-the-Line.pdf" download>↓ Download PDF</a>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 6.2vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            The climate movement has a storytelling problem.<br/>
            <em style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontWeight: 600 }}>Reality TV</em> could fix it.
          </h1>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 22, lineHeight: 1.45, color: MUTED, maxWidth: 640, margin: '0 0 40px' }}>
            A Stanford Graduate School of Business research on how to use Reality TV as a climate behavior change vehicle.
          </p>
          <div style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', borderTop: `1px solid ${INK}`, paddingTop: 16, marginBottom: 48 }}>
            Daniel Etzioni &amp; Nazlican Goksu Seira
            <span style={{ color: MUTED, fontWeight: 400, display: 'block', marginTop: 4 }}>
              GEN 390 · Independent Research Study · 2026
            </span>
            <span style={{ color: MUTED, fontWeight: 400, display: 'block', marginTop: 2 }}>
              Stanford Graduate School of Business
            </span>
          </div>

          <TabBar tab={tab} setTab={setTab} />

          {tab === 'paper' ? <PaperTab/> : <ProcessTab/>}

          <div style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginTop: 96, textAlign: 'center' }}>
            Created by Daniel Etzioni &amp; Nazlican Goksu Seira · GEN 390 · 2026
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PAPER TAB ──────────────────────
function PaperTab() {
  return (
    <>
      <p style={{ fontSize: 21, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 32, marginTop: 64 }}>
        Climate is no longer a Top-3 priority on either side of the American political spectrum. Half the country will not say the word out loud. The movement keeps speaking through scientists, journalists, and politicians — the three messengers half the country no longer hears.
      </p>
      <p>
        During our independent research at Stanford GSB, we kept circling one question: what would it take to reach the audience the climate movement has lost, without saying the word climate? This is our attempt to answer that. It documents the research that produced two unscripted television concepts — <strong>CROSSFIRE</strong> and <strong>ONE LAST THING</strong> — and the five principles and underlying climate goals that hold them together. The deeper research process lives in the <em>Process</em> tab for readers who want to see how the work was made.
      </p>

      <hr/>

      <H2 num="01 · THE PROBLEM">Climate doesn't have a content problem, it has a distribution problem.</H2>
      <p>
        The information is not missing. The science is not missing. What is missing is a vehicle that crosses the political line. Climate has, in five short years, become the thing nobody wants to be on a first date with. Roughly 70% of singles filter by politics before chemistry; the first question on a profile used to be your sign and is now your vote. Climate sits on the wrong side of that line for half the country.
      </p>
      <p>
        When reach drops, the movement's instinct is to add another messenger of the same kind: a louder scientist, a younger journalist, a more telegenic politician. The instinct fails because the problem is not literacy. Dan Kahan's work at Yale's Cultural Cognition Project shows the more scientifically literate a Republican becomes, the more skeptical of climate science they tend to be — and the same effect runs in reverse for Democrats (<Cite href="https://onlinelibrary.wiley.com/doi/10.1111/pops.12244">Kahan 2015</Cite>). Kahan calls this <em>identity-protective cognition</em>: people read evidence to protect the group they belong to. More facts deepen the fracture; they don't close it.
      </p>
      <Pull>
        We started from a single working hypothesis: <Highlight bg={RED}>the medium most underused for climate</Highlight> is <Highlight bg={BLUE}>the medium most consumed by the people the climate movement has stopped reaching</Highlight>. That medium is reality television.
      </Pull>

      <H2 num="02 · THE BET" color={BLUE}>Try the format the country actually watches.</H2>

      <H3>2.1 · The viewers the movement lost.</H3>
      <p>
        Reality TV is the most-watched form of unscripted entertainment in America, and the form climate has barely entered. The audiences who tune in for <em>Love Is Blind</em>, <em>Survivor</em>, <em>The Bachelor</em>, <em>Alone</em>, and <em>Married at First Sight</em> are the audiences the climate movement has lost. They are not anti-climate. They are anti-lecture. For twenty years, the movement's response when reach drops has been to make the lecture better — bigger budgets, sharper graphics, more telegenic experts. The bet inside this research is that the lecture itself is what's failing, and the way out is not a better one but a different form entirely.
      </p>

      <H3>2.2 · Stories slip past the argument.</H3>
      <p>
        Green and Brock showed audiences absorbed in a narrative drop the counterarguing reflex and adopt story-consistent beliefs (<Cite href="https://doi.org/10.1037/0022-3514.79.5.701">Green &amp; Brock 2000</Cite>). Bandura's social cognitive theory tells us why: people learn from characters who feel like them, not from authorities. Miguel Sabido proved it at scale in 1970s Mexico, where his telenovelas drove measurable enrollment in literacy programs and the adoption of family planning across Latin America (<Cite href="https://www.routledge.com/Entertainment-Education-and-Social-Change-History-Research-and-Practice/Singhal-Cody-Rogers-Sabido/p/book/9780805845532">Singhal et al. 2004</Cite>). The most-cited modern American example is MTV's <em>16 and Pregnant</em>, which <Cite href="https://www.nber.org/papers/w19795">Kearney &amp; Levine (2015)</Cite> linked to a 4.3% drop in teen births in the eighteen months after it aired — about a quarter of the total decline in U.S. teen childbearing during that period.
      </p>

      <H3>2.3 · The effect is real. It's smaller than the headlines.</H3>
      <p>
        MTV's <em>16 and Pregnant</em> — the reality series that followed teenage girls through the last months of pregnancy and the first months of motherhood — debuted in 2009. In 2015, the economists Melissa Kearney and Phillip Levine published a paper arguing the show drove a 4.3% drop in teen birth rates in the eighteen months after it aired, accounting for nearly a quarter of the total decline in U.S. teen childbearing during the period. It became the cleanest causal story the entertainment-education literature had about reality TV moving real-world behavior.
      </p>
      <p>
        The finding has since been contested. <Cite href="https://www.nber.org/papers/w24856">Jaeger, Joyce &amp; Kaestner (2018)</Cite> re-ran the Kearney–Levine analysis with one extra control — first for racial composition, then for local unemployment — and watched the effect vanish. Their placebo tests turned up phantom "effects" in periods before the show even aired. The lesson is humbler than the headline: drawing causal inference from a single national media event is genuinely hard.
      </p>
      <p>
        A second study is even more pointed. <Cite href="https://doi.org/10.1371/journal.pone.0138610">Paluck et al. (2015)</Cite> embedded eight pro-social messages into prime-time Spanish-language telenovelas — drunk driving, financial literacy, voter registration, others — and tracked what happened next. Small, immediate actions moved a little: a Google search the same evening, a brief behavior the same week. Anything that took sustained effort — opening a bank account, registering to vote — didn't move at all.
      </p>
      <p>
        The takeaway is specific. <strong>Embedded story is good at re-framing how a topic feels in a household. It's bad at producing big individual actions on a single exposure.</strong> A climate show should be designed against the framing job, not the action job. A good season can change the conversation a family has about the gas stove or the calving season. It can't, on its own, change the policy they vote for. We designed for the conversation.
      </p>

      <H3>2.4 · The cast is the message.</H3>
      <p>
        The literature is also clear about who. <Cite href="https://www.nature.com/articles/s41558-021-01070-1">Goldberg, Gustafson, Maibach &amp; Leiserowitz (2021)</Cite> tested climate ads featuring Bob Inglis (a former Republican congressman), Air Force General Ron Keys, and the evangelical climate scientist Katharine Hayhoe with Republican voters in two competitive congressional districts. The result: a seven-point increase in belief that warming is happening, and a ten-point increase in understanding that it is human-caused. Cass Sunstein calls these figures <em>surprising validators</em> — people whose support is unexpected given their identity. They cut through motivated reasoning because the audience cannot dismiss them as the other team. And as Paul Slovic's work on psychic numbing makes clear, climate's protagonist today has a ceiling; the movement needs more identifiable faces, not fewer (<Cite href="https://journal.sjdm.org/7303a/jdm7303a.htm">Slovic 2007</Cite>). The cast is the message.
      </p>

      <H2 num="03 · THE PRINCIPLES" color={RED}>Design principles the show would follow to deliver on the research.</H2>

      <H3>1. Reach is the whole game.</H3>
      <p>
        Most climate media is made for people who already think about climate. That is not nothing. It deepens conviction, it builds community, it raises money. But it cannot be the whole strategy of a movement that has lost the country's attention. If a piece of climate work cannot survive contact with someone who has never watched a climate documentary, it is not competing for the audience that decides which way the country goes. So we built for that viewer first. The choir, if it shows up, is welcome. It is not who we are writing for.
      </p>

      <H3>2. Change the story first.</H3>
      <p>
        Climate stories in the dominant register share a shape: countdown clocks, villains in suits, righteous protagonists, doom on the horizon. That register has saturated the people most likely to watch it and bounced off everyone else. What we are reaching for is closer to scripted prestige drama. Complex people. Real conditions. The dignity the genre extends to a meth cook in <em>Breaking Bad</em>, extended to a rancher and a rig worker. No villain montages. No score over a fact. The audience can tell when a documentary has decided who they are supposed to root for, and the audience the climate movement has lost has gotten very good at turning those documentaries off.
      </p>

      <H3>3. Anyone can be right. Anyone can be wrong.</H3>
      <p>
        The hardest rule to hold. The temptation is to put a thumb on the scale — to make the climate scientist a little more sympathetic than the rig worker, to give the rancher's son the last word in the calving-shed argument. We don't. The oil-field engineer in CROSSFIRE knows more about water scarcity than most people in her wife's Sierra Club chapter. The pastor, on his terms, is reading the data. If the audience can't imagine agreeing with anyone on screen by episode three, we've lost the room. The rancher, the firefighter, the pastor, the rig worker are not exceptions to the cast. They are the cast.
      </p>

      <H3>4. Give the viewer somewhere to stand.</H3>
      <p>
        Most climate media ends in one of two places — a donation link or a feeling of helplessness. Neither is an action. After Paluck (strong on framing, weak on big asks), we won't claim either show registers voters or closes emissions gaps. The claim is smaller: a good season, watched in millions of houses, can change the conversation those houses have the next morning. The action we want is the one that doesn't get cut off the next time the family sits down to dinner.
      </p>

      <H3>5. Watch it together.</H3>
      <p>
        The fifth rule is a distribution rule, not a design rule. This is media that has to be watched together. <Cite href="https://doi.org/10.1017/S0003055409990128">Paluck and Green (2009)</Cite> sat groups of forty around a portable stereo every month for a year in Rwanda, listening to <em>Musekeweya</em>, a soap opera about Hutu–Tutsi reconciliation. Group norms shifted. Personal attitudes barely moved. The Uganda follow-up sharpened it: <Cite href="https://doi.org/10.1177/0010414020912275">Green, Wilke and Cooper (2020)</Cite> found short videos cut reported domestic violence by roughly a quarter when watched in groups, and produced nothing measurable when watched alone on tablets. The lever isn't exposure. It's <em>common knowledge</em> — seeing what someone else also saw, and knowing they saw it. Most American climate media is built for solo phone viewing. We're building for Sunday-night football. A show families watch in the same room. A show people text each other about Monday morning. The point isn't to win the argument inside the family. It's to get the family talking again.
      </p>

      <H2 num="04 · UNDERLYING GOALS" color={BLUE}>What the show does while doing something else.</H2>
      <p>The five rules describe what the show is. The goals below describe the climate work the show is doing on the audience while it's doing something else — taken straight from the literature, and the part of the design that took longest to get right.</p>
      <ol>
        <li><strong>Unfreeze the table.</strong> Sever climate from political tribe by putting it back inside something older — a shared last name, a shared address, a shared meal — so that identity-protective cognition has nothing to defend (<Cite href="https://onlinelibrary.wiley.com/doi/10.1111/pops.12244">Kahan 2015</Cite>).</li>
        <li><strong>Carry it through story.</strong> Lead with character, conflict, and consequence. Climate is the texture and the stake, not the lesson (<Cite href="https://doi.org/10.1037/0022-3514.79.5.701">Green &amp; Brock 2000</Cite>; <Cite href="https://doi.org/10.1080/08934215.2020.1799049">Gustafson et al. 2020</Cite>).</li>
        <li><strong>Cast surprising validators.</strong> The rancher, the firefighter, the pastor, the rig worker. Trust transfers from messenger to message when the messenger is unexpected (<Cite href="https://www.nature.com/articles/s41558-021-01070-1">Goldberg, Gustafson, Maibach &amp; Leiserowitz 2021</Cite>).</li>
        <li><strong>Build for shared viewing.</strong> Common knowledge is the lever, and common knowledge requires watching together (<Cite href="https://doi.org/10.1017/S0003055409990128">Paluck &amp; Green 2009</Cite>; <Cite href="https://doi.org/10.1177/0010414020912275">Green, Wilke &amp; Cooper 2020</Cite>).</li>
      </ol>

      <H2 num="05 · THE CONCEPTS">Two shows.</H2>
      <p>Two concepts came through every round of feedback. Click through each card for the world, the cast, and the mechanics.</p>

      <ConceptCard
        accent={RED}
        label="CONCEPT 01 · DOCUMENTARY · 6×60′"
        title="CROSSFIRE."
        tag="Six households where climate is the fault line, and love is the only reason anyone stays at the table."
        interactive={<CrossfireQuiz />}
        short={
          <p>
            CROSSFIRE is a six-episode documentary style reality TV about American families who disagree about climate change but love each other anyway. Each episode follows one household in their kitchen, their calving shed, their truck on the way home from church. The conversations are real; they happen the way they happen at every American dinner table where people who voted differently still have to pass each other the salt. There is no narrator, no confessional cam, no producer setting up the drama. The camera just stays. In the finale, all six families sit down to dinner at the same hour across six time zones, intercut. <strong>Same questions and tensions on every table.</strong>
          </p>
        }
        detail={{
          world: "Kitchens, calving sheds, congregations, hardware stores, oilfield trailers, hospital break rooms. Climate is named in this show. It is named the way it is named in real American kitchens — through the cow that wouldn't deliver, the calving season two weeks late, the brisket that took fourteen hours, the gas-stove fight the family is too tired to have again, the well that ran low, the bill that doubled in March. The household is the unit of analysis the climate movement has missed. Policy lives in Washington; the conversation lives at the table, and that is where the camera stays.",
          cast: [
            { label: "Lansing, MI — The Argument.", body: "A father who has called climate change a hoax since 2010 and the daughter who came home from her first year of college a climate organizer. They love each other. They have not gotten through a Thanksgiving without one of them leaving the table since 2024. The episode films the year they try." },
            { label: "Permian Basin, TX — Rig & Vote.", body: "A husband who works the rigs married to a wife who organizes for the local Sierra Club chapter on Tuesdays. He pays the mortgage with oil. They have been married more than two decades." },
            { label: "Cheyenne, WY — The Land.", body: "A fourth-generation cattle rancher and the son who came home from grad school to convert the operation to regenerative grazing. The father loves the boy. The boy loves the land. They argue about both." },
            { label: "Tulsa, OK — Sermon & Data.", body: "A Pentecostal pastor whose only daughter is a NOAA climate scientist. Sunday morning he preaches dominion. Sunday afternoon she shows him the model. Both believe they are doing right by the same God." },
            { label: "Houma, LA — Water Line.", body: "A Cajun shrimper who has lost two boats to storms, the wife who manages the parish flood-insurance office, and a grandmother who will not move inland." },
            { label: "Morgantown, WV — Coal & Code.", body: "A laid-off coal foreman, his nurse wife, and the grandson who got a remote job at a clean-energy startup." },
            { label: "Phoenix, AZ — The Heat.", body: "A cop, an HVAC contractor, and the abuela who survived three 115° summers without AC. The family does not agree on the word for what is happening." },
          ],
          mechanics: [
            { title: "The kitchen as the unseen stage.", body: "Mornings, drives home, leftovers at midnight, the casserole that doesn't come out right. Cooking is how every family talks without having to." },
            { title: "No narrator. No confessionals.", body: "We never argue for a position. We argue that the conversation belongs in front of the camera." },
            { title: "The finale is six dinners.", body: "7:00 pm Eastern. The clock is the only edit. Each family cooks the meal we have watched them rehearse for six months. Same available light. Same long takes. We cut between them at the speed of a passing dish." },
          ],
          closing: "The most important conversations in America are happening at dinner. And no one is filming them.",
          edge: {
            intro: "The risk is real. A documentary about American families and climate, executed wrong, becomes a series of well-meaning vignettes — earnest, low-energy, easy to turn off. CNN-doc territory. Five decisions keep CROSSFIRE out of that lane.",
            rules: [
              { title: "The audience does the reading.", body: "No narrator. No confessionals. No graphics that explain why a moment matters. Every CNN doc explains itself; this one refuses to. If a beat needs a chyron to land, we cut the beat." },
              { title: "Cinematic, not journalistic.", body: "Single-cam, available light, 35mm-feel digital. Long lenses. The references are Hale County This Morning, This Evening; Faces Places; The Wolfpack — not 60 Minutes. The aesthetic decision is the genre signal: this is closer to prestige film than to current-affairs television." },
              { title: "The finale is a structural reveal.", body: "Six kitchens, one clock — 7 pm Eastern across six time zones, intercut at the speed of a passing dish. The whole season is a setup for that hour. The form itself is doing the argument. No documentary has done this before." },
              { title: "Tonal range. Real families are funny.", body: "CNN docs are not allowed to be funny. Real families are. The tonal reference is closer to a Frederick Wiseman cut than a PBS NewsHour package — funny, patient, at times unbearable. The audience has to feel it could be their dinner too." },
              { title: "No resolution.", body: "CNN docs end with hope or a call to action. CROSSFIRE ends with six families eating apart, finally talking about the same thing. The unresolved ending is the point: the audience leaves the season the way the families do, still inside the argument." },
            ],
          },
        }}
      />

      <ConceptCard
        accent={PINK}
        label="CONCEPT 02 · UNSCRIPTED DATING · 10 EPISODES"
        title="ONE LAST THING."
        tag="Sixteen strangers fall in love in post-fire LA, with two rules: no politics, no professions."
        interactive={<OneLastThingWall />}
        short={
          <p>
            ONE LAST THING is the show in which climate is never named. Sixteen Angelenos move into a glass house on a hillside above Altadena, sixteen months after the Palisades and Eaton fires, with a 14,000-acre burn scar visible from every window. They cannot share who they voted for or what they do for a living. They connect through prompts adapted from the <em>36 Questions</em>. They couple up. They propose. Then, on camera, in front of the person they just got engaged to, each contestant reveals the one last thing. <strong>Climate is in every shot, in every window, on every horizon — and in none of the dialogue.</strong>
          </p>
        }
        detail={{
          world: "A glass house in the hills above Altadena. Below, a 14,000-acre burn scar still smelling of creosote. Climate never enters the dialogue. It is in the burn scar visible from every window of the house, in the smell of creosote that hangs in the canyon at dusk, in the firefighter's sleep schedule, in the developer's spreadsheets, in the abuela's hand on the door. The show puts climate above the political line, in front of the camera, inside the love story — so that audiences who would scroll past a climate documentary cannot scroll past it here.",
          cast: [
            { label: "Lost everything · Palisades.", body: "She came back to the city she grew up in to look at the lot her family lived on for thirty years." },
            { label: "Firefighter · LAFD.", body: "He worked the line in January. He has not slept past 5 a.m. since." },
            { label: "Climate organizer · Compton.", body: "She is tired of being the only one in the room who says the word." },
            { label: "Developer · buying burned lots.", body: "He is doing the math on what to build back. He is not the villain. He just does not know the room he is in yet." },
            { label: "Fifth-grade teacher · Altadena.", body: "Her classroom is gone. The kids are split across three schools." },
            { label: "Insurance adjuster.", body: "He has read every claim from the Eaton fire. He has not told anyone in this house what he does." },
            { label: "Evangelical worship leader.", body: "She prays for the city. She does not know yet who else in this room prays at all." },
            { label: "Oil-family son · originally Midland, TX.", body: "He moved to LA five years ago. He has not told his parents he stays." },
          ],
          mechanics: [
            { title: "The two rules.", body: "No politics. No professions. The first two things you normally learn about someone become the last." },
            { title: "The proposal.", body: "When a couple commits, they sit down on camera and reveal the one last thing — their job, their politics, their family's relationship to the fires. The producer asks one question: would you have swiped right?" },
            { title: "The world after the house.", body: "Each couple visits the partner's part of town. The block that did burn, or the block that's profiting, or the block that wishes it would. The fires do the political work the show refuses to do." },
            { title: "The altar.", body: "A church in Altadena, half rebuilt. Each couple walks the aisle. The officiant asks one question. Yes or no." },
          ],
          closing: "What if the climate movement's last unfilmed room is the one with people who love each other in it?",
        }}
      />

      <H3>5.3 · Why two concepts, not one.</H3>
      <p>
        CROSSFIRE plays the existing political fracture by filming the people who refuse to let it become a wall. Climate is named, and the families work it out across the table. ONE LAST THING bypasses the fracture by deleting the filter and watching what is left. Climate is everywhere on screen and never on the page. They are different bets on the same problem.
      </p>
      <p>
        The two formats also speak to different rooms in the industry. CROSSFIRE belongs with documentary slates and unscripted-prestige producers — the lineage of <em>Hale County</em>, <em>Faces Places</em>, <em>The Wolfpack</em>. ONE LAST THING belongs with streaming unscripted dating and event-format producers — the lineage of <em>Love Is Blind</em>, <em>The Ultimatum</em>, <em>Couples Therapy</em>. Built deliberately so that the same body of research walks into two different doors.
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th><span className="swatch" style={{ background: RED }}/>CROSSFIRE</th>
            <th><span className="swatch" style={{ background: PINK }}/>ONE LAST THING</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Form</strong></td><td>Observational documentary</td><td>Reality dating</td></tr>
          <tr><td><strong>Length</strong></td><td>Six 60-minute episodes</td><td>Ten episodes</td></tr>
          <tr><td><strong>Mechanism</strong></td><td>The kitchen as the household stage</td><td>The reveal as the structural twist</td></tr>
          <tr><td><strong>Tone</strong></td><td>Funny, patient, at times unbearable</td><td>Tender, slow, then loud</td></tr>
          <tr><td><strong>Where the producer sits</strong></td><td>Documentary &amp; unscripted-prestige slates</td><td>Streaming dating &amp; event-format slates</td></tr>
          <tr><td><strong>How climate appears</strong></td><td>Named, in the family vocabulary: calving season, gas stove, brisket, well, bill, the cow that wouldn't deliver</td><td>Unnamed, embedded twice: in the city (the burn scar from every window, the creosote, the firefighter's sleep) and in the cast itself (some believe, some don't — the reveal exposes who)</td></tr>
          <tr><td><strong>The friction</strong></td><td>A denier dad and an activist daughter. A husband on the rig and a wife at the Sierra Club. A pastor and his climate-scientist daughter. People across one last name.</td><td>Sixteen strangers, no labels, two rules.</td></tr>
          <tr><td><strong>The viewer's question</strong></td><td>Can love hold the conversation open?</td><td>Does the one last thing matter, or does love win?</td></tr>
        </tbody>
      </table>

      <H2 num="06 · WHAT WE GOT WRONG">Three ideas we walked away from.</H2>
      <ol>
        <li><strong>The competition reflex.</strong> Our first concept was a $1M island business competition. On paper it had every principle in it. It came apart in the divided-family interviews because it was aspirational in a register the audience does not trust on this topic. Climate is happening at the kitchen table; pretending otherwise looked like a tech-conference fantasy of how change happens.</li>
        <li><strong>The explainer reflex.</strong> Several intermediate drafts had narrators, confessionals, or graphics that told the audience why a moment mattered. The unspoken-thesis rule replaced every explainer. If the audience needs a chyron to feel what they're seeing, we cast the wrong people.</li>
        <li><strong>The villain reflex.</strong> Every climate documentary the right-leaning cohort had ever seen cast someone like them as the antagonist. We removed the villain entirely. There is no antagonist in either show. The friction is between people who love each other.</li>
      </ol>

      <H2 num="07 · THE TAKE">Three things to take with you.</H2>
      <p>Three things travel beyond this project.</p>
      <ol>
        <li><strong>A diagnostic.</strong> When a topic loses cultural reach, the failure is rarely the topic. It is the medium and the messenger. The fix is to look at the audience's media diet and build a vehicle inside it.</li>
        <li><strong>A framework.</strong> Five principles and a set of underlying climate goals, portable to any other politically fractured topic: immigration, guns, AI, fertility.</li>
        <li><strong>Two formats worth building.</strong> CROSSFIRE and ONE LAST THING are different bets on the same problem, built for different rooms in the industry.</li>
      </ol>
      <Pull>
        The most important conclusion is also the simplest. <Highlight bg={PINK} fg={INK}>The climate movement's last unfilmed room</Highlight> is the one with people who love each other in it.
      </Pull>

      <hr/>

      <H2 num="REF · REFERENCES">Where the work stands on.</H2>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: MUTED }}>
        <Ref>Bandura, A. <em>Social Cognitive Theory of Mass Communication.</em> In Bryant &amp; Oliver (Eds.), Media Effects.</Ref>
        <Ref>Goldberg, M.H., Gustafson, A., Rosenthal, S.A., &amp; Leiserowitz, A. (2021). Shifting Republican views on climate change through targeted advertising. <em>Nature Climate Change</em>, 11, 573–577. <Cite href="https://www.nature.com/articles/s41558-021-01070-1">link</Cite></Ref>
        <Ref>Green, D.P., Wilke, A.M., &amp; Cooper, J. (2020). Countering Violence Against Women by Encouraging Disclosure: A Mass Media Experiment in Rural Uganda. <em>Comparative Political Studies</em>, 53. <Cite href="https://doi.org/10.1177/0010414020912275">link</Cite></Ref>
        <Ref>Green, M.C., &amp; Brock, T.C. (2000). The Role of Transportation in the Persuasiveness of Public Narratives. <em>Journal of Personality and Social Psychology</em>, 79, 701–721. <Cite href="https://doi.org/10.1037/0022-3514.79.5.701">link</Cite></Ref>
        <Ref>Gustafson, A., et al. (2020). Personal stories can shift climate change beliefs and risk perceptions. <em>Communication Reports</em>. <Cite href="https://doi.org/10.1080/08934215.2020.1799049">link</Cite></Ref>
        <Ref>Jaeger, D.A., Joyce, T.J., &amp; Kaestner, R. (2018). Did Reality TV Really Cause a Decline in Teenage Childbearing? A Cautionary Tale of Evaluating Identifying Assumptions. NBER Working Paper 24856. <Cite href="https://www.nber.org/papers/w24856">link</Cite></Ref>
        <Ref>Kahan, D.M. (2015). Climate-Science Communication and the Measurement Problem. <em>Political Psychology</em>, 36, 1–43. <Cite href="https://onlinelibrary.wiley.com/doi/10.1111/pops.12244">link</Cite></Ref>
        <Ref>Kearney, M.S., &amp; Levine, P.B. (2015). Media Influences on Social Outcomes: The Impact of MTV's 16 and Pregnant on Teen Childbearing. <em>American Economic Review</em>, 105(12), 3597–3632. <Cite href="https://www.nber.org/papers/w19795">link</Cite></Ref>
        <Ref>Paluck, E.L., &amp; Green, D.P. (2009). Deference, Dissent, and Dispute Resolution: An Experimental Intervention Using Mass Media to Change Norms and Behavior in Rwanda. <em>American Political Science Review</em>, 103, 622–644. <Cite href="https://doi.org/10.1017/S0003055409990128">link</Cite></Ref>
        <Ref>Paluck, E.L., Lagunes, P., Green, D.P., Vavreck, L., Peer, L., &amp; Gomila, R. (2015). Does Product Placement Change Television Viewers' Social Behavior? <em>PLOS ONE</em>. <Cite href="https://doi.org/10.1371/journal.pone.0138610">link</Cite></Ref>
        <Ref>Singhal, A., Cody, M.J., Rogers, E.M., &amp; Sabido, M. (2004). <em>Entertainment-Education and Social Change.</em> Routledge. <Cite href="https://www.routledge.com/Entertainment-Education-and-Social-Change-History-Research-and-Practice/Singhal-Cody-Rogers-Sabido/p/book/9780805845532">link</Cite></Ref>
        <Ref>Slovic, P. (2007). "If I look at the mass I will never act": Psychic numbing and genocide. <em>Judgment and Decision Making</em>, 2, 79–95. <Cite href="https://journal.sjdm.org/7303a/jdm7303a.htm">link</Cite></Ref>
        <Ref>Small, D.A., Loewenstein, G., &amp; Slovic, P. (2007). Sympathy and callousness. <em>Organizational Behavior and Human Decision Processes</em>, 102, 143–153. <Cite href="https://doi.org/10.1016/j.obhdp.2006.01.005">link</Cite></Ref>
        <Ref>Sunstein, C.R. (2014). On Surprising Validators. (Various essays; <em>Conformity</em>, 2019.) <Cite href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2444649">link</Cite></Ref>
        <Ref>Tversky, A., &amp; Kahneman, D. (1973). Availability: A heuristic for judging frequency and probability. <em>Cognitive Psychology</em>, 5, 207–232. <Cite href="https://doi.org/10.1016/0010-0285(73)90033-9">link</Cite></Ref>
      </div>
    </>
  );
}

const Ref: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ textIndent: -22, paddingLeft: 22, marginBottom: 14 }}>{children}</p>
);

// ─── PROCESS TAB ──────────────────────
function ProcessTab() {
  return (
    <>
      <H2 num="A · LITERATURE REVIEW">The literature, in eight pieces.</H2>
      <p>
        We anchored the project to research on persuasion, identity, and entertainment-education. We took the strongest claims seriously and the critiques equally seriously. The literature does not say <em>media changes behavior</em>. It says <em>media can change behavior under certain conditions, and only certain kinds of behavior</em>. Both halves matter.
      </p>

      <H3>A.1 · Identity, not literacy.</H3>
      <p>
        Dan Kahan's work at the Yale Cultural Cognition Project established that climate disagreement does not respond to facts in the way the movement assumes. The more scientifically literate a Republican becomes, the more skeptical of climate science they tend to be; the same effect runs in reverse for Democrats (<Cite href="https://onlinelibrary.wiley.com/doi/10.1111/pops.12244">Kahan 2015</Cite>). Kahan calls this <em>identity-protective cognition</em>: people interpret evidence to protect the group they belong to. The implication is severe. Adding facts to a politically-coded topic deepens the fracture.
      </p>

      <H3>A.2 · Stories slip past the argument.</H3>
      <p>
        Green and Brock's narrative transportation research at Penn established that audiences absorbed in a story drop their counterarguing reflex and adopt story-consistent beliefs (<Cite href="https://doi.org/10.1037/0022-3514.79.5.701">Green &amp; Brock 2000</Cite>). Bandura's social cognitive theory explains the mechanism on the audience side: people learn behaviors vicariously from characters who feel like them. Together these two findings underwrite the entire entertainment-education tradition.
      </p>

      <H3>A.3 · Sabido proved it at scale.</H3>
      <p>
        Miguel Sabido's telenovelas in 1970s Mexico drove measurable enrollment in adult literacy programs and adoption of family planning across Latin America. The full record of that tradition is in <Cite href="https://www.routledge.com/Entertainment-Education-and-Social-Change-History-Research-and-Practice/Singhal-Cody-Rogers-Sabido/p/book/9780805845532">Singhal, Cody, Rogers &amp; Sabido (2004)</Cite>. Embedded narratives produce measurable behavior change at population scale when they are designed against a specific behavior and broadcast for long enough.
      </p>

      <H3>A.4 · 16 and Pregnant, and its critics.</H3>
      <p>
        The most contested example in the modern literature is MTV's <em>16 and Pregnant</em>. <Cite href="https://www.nber.org/papers/w19795">Kearney &amp; Levine (2015)</Cite> found that the show's introduction was associated with a 4.3% reduction in teen birth rates in the eighteen months following its airing — accounting for nearly a quarter of the overall decline in U.S. teen childbearing during that period.
      </p>
      <p>
        That finding has been contested. <Cite href="https://www.nber.org/papers/w24856">Jaeger, Joyce &amp; Kaestner (2018)</Cite> re-examined the result and showed that controlling for differential pre-treatment trends in birth rates by racial/ethnic composition or unemployment rate causes the Kearney–Levine effect to disappear. Placebo tests find an "effect" in periods long before the show began broadcasting. Their conclusion is humbler than a headline number: drawing causal inference from a national point-in-time media event is genuinely hard.
      </p>
      <p>
        We took both papers as instructive. <strong>The strong reading</strong> — reality TV can move a needle on a sensitive personal behavior at population scale — is plausible and has narrative weight. <strong>The weak reading</strong> — that even a well-designed show, on a topic the audience already cares about, may not produce the effect we assume — is the discipline that kept us from overpromising.
      </p>

      <H3>A.5 · What embedded story can't do.</H3>
      <p>
        <Cite href="https://doi.org/10.1371/journal.pone.0138610">Paluck et al. (2015)</Cite> ran a field experiment embedding eight pro-social messages into three prime-time Spanish-language telenovelas. Two of eight effects were statistically significant; none were substantively large or long-lasting. Behaviors that could be acted on during or right after viewing — search, brief engagement — were briefly affected. Behaviors requiring sustained effort — opening a bank account, registering to vote — were not. This is the most important corrective in the literature for anyone designing media interventions. <strong>Embedded messaging is more useful for re-framing how a topic feels than for producing specific large actions.</strong> Both of our final formats are designed against the first job, not the second.
      </p>

      <H3>A.6 · Surprising validators.</H3>
      <p>
        <Cite href="https://www.nature.com/articles/s41558-021-01070-1">Goldberg, Gustafson, Maibach &amp; Leiserowitz (2021)</Cite> in Nature Climate Change tested climate ads featuring Bob Inglis (former Republican congressman), Air Force General Ron Keys, and evangelical climate scientist Katharine Hayhoe with Republican voters in two competitive congressional districts. The result was a seven-point increase in belief that global warming is happening and a ten-point increase in understanding it is human-caused. Cass Sunstein calls these figures <em>surprising validators</em>: people whose support is unexpected given their identity. They cut through motivated reasoning because the audience cannot dismiss them as the other team.
      </p>

      <H3>A.7 · Watching together changes the room.</H3>
      <p>
        Two studies, both led by Donald Green and collaborators, showed that the lever in mass-media behavior change is often <em>shared viewing</em>, not exposure alone. In Rwanda, <Cite href="https://doi.org/10.1017/S0003055409990128">Paluck &amp; Green (2009)</Cite> sat groups of forty around a portable stereo every month for a year, listening to <em>Musekeweya</em>, a soap opera about reconciliation. Group norms shifted. Personal attitudes barely moved. In Uganda, <Cite href="https://doi.org/10.1177/0010414020912275">Green, Wilke &amp; Cooper (2020)</Cite> found that short videos cut reported domestic violence by roughly a quarter when watched communally; the same videos watched alone on tablets produced nothing. The mechanism is <em>common knowledge</em>: when you watch with others, you absorb the message and you learn that they absorbed it too. Both of our formats are designed to be watched in groups.
      </p>

      <H3>A.8 · Personal stories beat statistics.</H3>
      <p>
        Paul Slovic's research on <em>psychic numbing</em> shows that compassion peaks at one identifiable victim and collapses as the number grows abstract (<Cite href="https://journal.sjdm.org/7303a/jdm7303a.htm">Slovic 2007</Cite>; <Cite href="https://doi.org/10.1016/j.obhdp.2006.01.005">Small, Loewenstein &amp; Slovic 2007</Cite>). Climate has had the opposite problem of a famine: its protagonist today has a ceiling and it needs more heroes. <Cite href="https://doi.org/10.1080/08934215.2020.1799049">Gustafson et al. (2020)</Cite> confirms that personal climate stories shift moderates' and conservatives' beliefs, and the shift is mediated specifically by emotions like worry and compassion.
      </p>

      <H2 num="B · ACADEMIC CONVERSATIONS">Academic feedback.</H2>
      <p>We met with Stanford professors across ethics, economics, behavior change, climate science, marketing, and policy. Each conversation re-shaped the design constraints.</p>
      <ul>
        <li><strong>Ethics.</strong> Where is the line between persuasion and manipulation when audiences do not know they are watching a climate show? We resolved this by committing to the <em>unspoken thesis</em> rule: the show never argues for a position; it argues that the conversation belongs in front of the camera.</li>
        <li><strong>Economics.</strong> What does behavior change worth filming actually look like at the household level? Energy bills, insurance premiums, water rights, and food cost are where climate is already in the room. We made these the texture of every episode rather than the topic.</li>
        <li><strong>Behavior change.</strong> A reminder that single-exposure media rarely shifts behavior; what shifts behavior is <em>common knowledge</em>. This pushed us toward formats that were watchable communally.</li>
        <li><strong>Climate science.</strong> The fault lines we should film are not coastal flooding and headline disasters; they are calving seasons, drought-stunted tomatoes, regional fire calendars, and the well that ran low. The everyday is more persuasive than the catastrophic.</li>
        <li><strong>Marketing.</strong> The audience's existing media diet is the brief. A climate show is a marketing failure the moment it stops looking like the shows it sits next to on the menu.</li>
        <li><strong>Policy.</strong> Climate as policy is dead at the kitchen table. Climate as land, labor, faith, family, and water is alive everywhere. The political vocabulary has to be replaced with the vocabulary the household already uses.</li>
      </ul>

      <H2 num="C · ONE-ON-ONE INTERVIEWS">At the kitchen table.</H2>

      <H3>C.1 · Inside divided families.</H3>
      <p>
        We talked with people inside families where climate or politics is the fault line. The conversations were not about climate as a topic. They were about the table — what gets said, what doesn't, the moment a parent stops the conversation, the moment a sibling steps around it.
      </p>
      <p>
        The pattern was specific and unsentimental. <strong>Inside the closest families, politics erodes.</strong> The same household that cannot finish a climate sentence in public will spend an hour on why the calving season is two weeks late, or why the bill doubled in March, or why the boat did not come back. The vocabulary changes; the subject does not. <strong>In families that are less close, climate becomes a taboo topic</strong> — one of a small list of things you do not bring up if you want the holiday to end well. The same person can be inside both kinds of family at once.
      </p>
      <Pull>
        <Highlight bg={RED}>Love</Highlight> is the only thing strong enough to hold the conversation <Highlight bg={BLUE}>open</Highlight>.
      </Pull>

      <H3>C.2 · The right-leaning, climate-curious.</H3>
      <p>A second cohort: people who care about climate but vote on the right, or feel that the existing climate movement does not have a seat for them. Three things came up in nearly every conversation.</p>
      <ol>
        <li><strong>They have no team.</strong> They feel ridiculed by the climate movement and dismissed by their own political identity for caring.</li>
        <li><strong>They want a way to talk to their family without losing them.</strong> The fear is not being wrong about climate; it is being unrecognizable to the people they love.</li>
        <li><strong>They are tired of being the villain.</strong> Every climate documentary they have ever sampled cast someone like them as the antagonist. They turn it off in the first ten minutes.</li>
      </ol>

      <H2 num="D · THE BRAINSTORM TOOL">An iterative research process.</H2>
      <p>
        Before either group session, we built a custom collaborative brainstorming tool, deployed at <a href="/brainstorm">390realitytv.vercel.app/brainstorm</a>, because the off-the-shelf options (Miro, Mural, FigJam) were either too generic or too friction-heavy for the kind of room we wanted to host. The tool ran the entire ideation arc inside a single shared canvas.
      </p>
      <ul>
        <li><strong>Brain Dump.</strong> A 6×6 post-it grid with a four-minute timer, anchored by a single question — <em>what makes a great reality TV show?</em> — to surface format intuitions before we showed anyone our concepts.</li>
        <li><strong>Confirm or Complicate.</strong> Each candidate concept got its own 4×4 grid where the room could push back or build on the format.</li>
        <li><strong>Design Your Show.</strong> A structured worksheet (title, one-line pitch, format it borrows from, the hook, who is in it, how does behavior change happen, the wild card) that asked every participant to write their own version of a climate-reality-TV concept.</li>
        <li><strong>All Submissions.</strong> A shared gallery where the room could read every concept the others had written and "heart" the strongest ones.</li>
      </ul>
      <p>The tool was its own research artifact. Building it forced us to commit to a funnel — <em>what makes any reality show work</em>, then <em>does climate fit this format</em>, then <em>can I write one myself</em> — that became the same funnel we used in every academic conversation and every Hollywood meeting.</p>

      <Figure src="/paper/tool-brain-dump.png" n="FIG. 1" caption="Brain Dump. A four-minute, six-by-six prompt to surface format intuitions before any concept was shown." />
      <div className="figrow">
        <Figure src="/paper/concept-one-last-thing.png" n="FIG. 2" caption="A concept page inside the tool. Each candidate format had its own page with logline, narrative, cast, and mechanics." />
        <Figure src="/paper/tool-confirm-complicate.png" n="FIG. 3" caption="Confirm or Complicate. After each concept reveal, the room pushed back or built on it." />
      </div>
      <Figure src="/paper/tool-design-your-show.png" n="FIG. 4" caption="Design Your Show. A structured worksheet asking each participant to write their own climate-reality-TV concept." />

      <H2 num="E · GROUP BRAINSTORMS">Two rooms. Five concepts. Two survived.</H2>
      <p>
        We hosted group ideation sessions inside the tool with two rooms.
      </p>
      <ul>
        <li><strong>Designers, tech &amp; media experts.</strong> Two consecutive sessions in early April. The room pushed us toward sensory specificity (the casserole, the gas stove, the boat that didn't come back) and away from explainer logic. It also pushed us toward formats with built-in stakes that did not have to be invented: marriage, money, land, dinner.</li>
        <li><strong>GSB reality-TV fans.</strong> A single longer session in mid-April. This room was where the <em>no politics, no professions</em> rule was first articulated. It was also where dating formats first surfaced as the strongest carrier for the question of whether love can survive what's been done to the political conversation.</li>
        <li><strong>Concept-feedback sessions</strong> with a small set of named reviewers (<strong>Anne &amp; Randip</strong>, <strong>Allison</strong>, <strong>Maxine</strong>) who pressure-tested the surviving formats one at a time.</li>
      </ul>
      <p>The brainstorms produced five candidate concepts that we narrowed.</p>
      <ol>
        <li><em>Is This a Good Business?</em> — Ten entrepreneurs with $1M to build a business on a small island. Set aside for being too aspirational and too distant from American kitchens.</li>
        <li><em>The Race</em> — A cross-country competition format threading climate-changed landscapes. Set aside for looking too much like <em>The Amazing Race</em> without enough new mechanism.</li>
        <li><em>The Calendar</em> — A year inside one community as the seasons shift. Set aside for being too documentary, not enough format.</li>
        <li><em>Save My Island</em> — A community-led storytelling format. Folded into Concept 1 and then retired.</li>
        <li><em>The Paradise</em> — Earlier draft of what became ONE LAST THING.</li>
      </ol>
      <p>Two concepts survived.</p>

      <Figure src="/paper/concept-good-business.png" n="FIG. 5" caption='An early concept that did not survive — "Is This a Good Business?"' />

      <H2 num="F · HOLLYWOOD EXPERT INTERVIEWS">What the producers said.</H2>
      <p>
        We spoke with managers, producers, and unscripted-format developers in Los Angeles — the questions a research deck cannot answer: does this sell, does this cast, does this shoot, does this last a season. Their input rewired both formats. The notes from those sessions sit in the production-side documentation; they are not part of this public research out of respect for the people who shared them.
      </p>
    </>
  );
}
