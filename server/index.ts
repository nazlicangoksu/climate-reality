import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const IMAGES_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'concepts');

// Ensure directories exist
for (const dir of [DATA_DIR, SESSIONS_DIR, IMAGES_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const conceptId = req.params.conceptId;
    const category = req.query.category || 'storyboard';
    const ts = Date.now();
    cb(null, `${conceptId}-${category}-${ts}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON(filePath: string, fallback: any = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJSON(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Interview Sessions ───────────────────────────────────────────────────────

// GET all sessions
app.get('/api/sessions', (_req, res) => {
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  const sessions = files.map(file => {
    const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
    return JSON.parse(content);
  });
  sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  res.json(sessions);
});

// GET single session
app.get('/api/sessions/:id', (req, res) => {
  const filePath = path.join(SESSIONS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Session not found' });
  res.json(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
});

// POST create session
app.post('/api/sessions', (req, res) => {
  const session = {
    id: `session-${Date.now()}`,
    participantName: req.body.participantName || '',
    participantRole: req.body.participantRole || '',
    organization: req.body.organization || '',
    context: req.body.context || '',
    startTime: new Date().toISOString(),
    endTime: null,
    // Freeflow notes (markdown-style text)
    openingNotes: '',
    // Concept reactions: { conceptId: { rating: 1-5, notes: '', wouldWatch: bool } }
    conceptReactions: {},
    // Quick idea cards: [{ id, title, notes, tags }]
    ideaCards: [],
    // Closing notes
    closingNotes: '',
  };
  const filePath = path.join(SESSIONS_DIR, `${session.id}.json`);
  saveJSON(filePath, session);
  res.status(201).json(session);
});

// PUT update session (used throughout the interview flow)
app.put('/api/sessions/:id', (req, res) => {
  const filePath = path.join(SESSIONS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Session not found' });
  const session = { ...req.body, id: req.params.id };
  saveJSON(filePath, session);
  res.json(session);
});

// DELETE session
app.delete('/api/sessions/:id', (req, res) => {
  const filePath = path.join(SESSIONS_DIR, `${req.params.id}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

// ── Synthesis Aggregate ──────────────────────────────────────────────────────

app.get('/api/synthesis', (_req, res) => {
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  const sessions = files.map(file => {
    return JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8'));
  });

  const completed = sessions.filter(s => s.endTime);

  // Concept reaction aggregates
  const conceptAgg: Record<string, {
    ratings: number[];
    wouldWatch: number;
    total: number;
    notes: string[];
  }> = {};

  for (const s of completed) {
    for (const [conceptId, reaction] of Object.entries(s.conceptReactions || {}) as [string, any][]) {
      if (!conceptAgg[conceptId]) {
        conceptAgg[conceptId] = { ratings: [], wouldWatch: 0, total: 0, notes: [] };
      }
      conceptAgg[conceptId].total++;
      if (reaction.rating > 0) conceptAgg[conceptId].ratings.push(reaction.rating);
      if (reaction.wouldWatch) conceptAgg[conceptId].wouldWatch++;
      if (reaction.notes?.trim()) conceptAgg[conceptId].notes.push(reaction.notes.trim());
    }
  }

  const conceptSummaries = Object.entries(conceptAgg).map(([conceptId, data]) => ({
    conceptId,
    avgRating: data.ratings.length > 0
      ? Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 10) / 10
      : 0,
    wouldWatchPct: data.total > 0 ? Math.round((data.wouldWatch / data.total) * 100) : 0,
    totalReviewed: data.total,
    allNotes: data.notes,
  }));

  // All idea cards across sessions
  const allIdeas: any[] = [];
  for (const s of completed) {
    for (const idea of (s.ideaCards || [])) {
      allIdeas.push({
        ...idea,
        sessionId: s.id,
        participantName: s.participantName,
        participantRole: s.participantRole,
        organization: s.organization,
      });
    }
  }

  // All opening + closing notes
  const allNotes = completed.map(s => ({
    sessionId: s.id,
    participantName: s.participantName,
    participantRole: s.participantRole,
    organization: s.organization,
    date: s.startTime,
    openingNotes: s.openingNotes || '',
    closingNotes: s.closingNotes || '',
  }));

  res.json({
    totalSessions: sessions.length,
    completedSessions: completed.length,
    conceptSummaries,
    allIdeas,
    allNotes,
  });
});

// ── Video URLs for show concepts ─────────────────────────────────────────────

const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');

app.get('/api/videos', (_req, res) => {
  res.json(loadJSON(VIDEOS_FILE, {}));
});

app.put('/api/videos/:conceptId', (req, res) => {
  const { videoUrl } = req.body;
  const videos = loadJSON(VIDEOS_FILE, {});
  videos[req.params.conceptId] = videoUrl?.trim() || '';
  saveJSON(VIDEOS_FILE, videos);
  res.json(videos);
});

// ── Concept Media (images per concept) ───────────────────────────────────────

const MEDIA_FILE = path.join(DATA_DIR, 'concept-media.json');

app.get('/api/concept-media', (_req, res) => {
  res.json(loadJSON(MEDIA_FILE, {}));
});

// Upload image for a concept (with category: storyboard | mood)
app.post('/api/concept-media/:conceptId/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  const media = loadJSON(MEDIA_FILE, {});
  const conceptId = req.params.conceptId;
  const category = (req.query.category as string) || 'storyboard';
  if (!media[conceptId]) media[conceptId] = { storyboard: [], mood: [], videoUrl: '' };
  // Migrate old format
  if (media[conceptId].images) {
    media[conceptId].storyboard = media[conceptId].images;
    delete media[conceptId].images;
  }
  if (!media[conceptId].storyboard) media[conceptId].storyboard = [];
  if (!media[conceptId].mood) media[conceptId].mood = [];
  const imgPath = `/images/concepts/${req.file.filename}`;
  if (category === 'mood') {
    media[conceptId].mood.push(imgPath);
  } else {
    media[conceptId].storyboard.push(imgPath);
  }
  saveJSON(MEDIA_FILE, media);
  res.json(media[conceptId]);
});

// Delete an image from a concept
app.delete('/api/concept-media/:conceptId/image', (req, res) => {
  const { imagePath } = req.body;
  const media = loadJSON(MEDIA_FILE, {});
  const conceptId = req.params.conceptId;
  if (!media[conceptId]) return res.json({ storyboard: [], mood: [], videoUrl: '' });
  media[conceptId].storyboard = (media[conceptId].storyboard || []).filter((img: string) => img !== imagePath);
  media[conceptId].mood = (media[conceptId].mood || []).filter((img: string) => img !== imagePath);
  saveJSON(MEDIA_FILE, media);
  const fullPath = path.join(__dirname, '..', 'client', 'public', imagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  res.json(media[conceptId]);
});

// Set video URL for a concept
app.put('/api/concept-media/:conceptId/video', (req, res) => {
  const { videoUrl } = req.body;
  const media = loadJSON(MEDIA_FILE, {});
  const conceptId = req.params.conceptId;
  if (!media[conceptId]) media[conceptId] = { images: [], videoUrl: '' };
  media[conceptId].videoUrl = videoUrl?.trim() || '';
  saveJSON(MEDIA_FILE, media);
  res.json(media[conceptId]);
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
