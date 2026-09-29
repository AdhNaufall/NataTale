import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Memory Schema & Model
const memorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  story: { type: String, required: true },
  images: { type: [String], default: [] },
  category: { type: String, required: true },
  mood: { type: String, required: false },
  rating: { type: Number, default: 5 },
  spotifyUrl: { type: String, default: '' },
  spotifyTitle: { type: String, default: '' },
  spotifyArtist: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Memory = mongoose.model('Memory', memorySchema);

// Letter Schema & Model (New Letters Module)
const letterSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  signature: { type: String, default: '' },
  isOpened: { type: Boolean, default: false },
  openedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Letter = mongoose.models.Letter || mongoose.model('Letter', letterSchema);

// --- API Routes ---

// GET: Fetch all memories (sorted by date)
app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ date: 1 });
    // Map _id to id for frontend compatibility
    const formatted = memories.map(m => ({
      id: m._id.toString(),
      title: m.title,
      date: m.date.toISOString().split('T')[0],
      location: m.location,
      story: m.story,
      images: m.images,
      category: m.category,
      mood: m.mood,
      rating: m.rating,
      spotifyUrl: m.spotifyUrl || '',
      spotifyTitle: m.spotifyTitle || '',
      spotifyArtist: m.spotifyArtist || ''
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// POST: Add a new memory
app.post('/api/memories', async (req, res) => {
  try {
    const newMemory = new Memory(req.body);
    const saved = await newMemory.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

// PUT: Update an existing memory
app.put('/api/memories/:id', async (req, res) => {
  try {
    const updated = await Memory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Returns the updated document
    );
    if (!updated) return res.status(404).json({ error: 'Memory not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE: Remove a memory
app.delete('/api/memories/:id', async (req, res) => {
  try {
    const deleted = await Memory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Memory not found' });
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// --- LETTERS API ROUTES ---

// GET: Fetch all letters
app.get('/api/letters', async (req, res) => {
  try {
    const letters = await Letter.find().sort({ createdAt: -1 });
    const formatted = letters.map(l => ({
      id: l._id.toString(),
      sender: l.sender,
      recipient: l.recipient,
      title: l.title,
      content: l.content,
      category: l.category,
      signature: l.signature || '',
      isOpened: Boolean(l.isOpened),
      openedAt: l.openedAt ? l.openedAt.toISOString() : null,
      createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString()
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch letters' });
  }
});

// POST: Create a new letter
app.post('/api/letters', async (req, res) => {
  try {
    const newLetter = new Letter({
      sender: req.body.sender,
      recipient: req.body.recipient,
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      signature: req.body.signature || '',
      isOpened: Boolean(req.body.isOpened),
      openedAt: req.body.openedAt ? new Date(req.body.openedAt) : null,
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
    });
    const saved = await newLetter.save();
    res.status(201).json({
      id: saved._id.toString(),
      sender: saved.sender,
      recipient: saved.recipient,
      title: saved.title,
      content: saved.content,
      category: saved.category,
      signature: saved.signature || '',
      isOpened: saved.isOpened,
      openedAt: saved.openedAt ? saved.openedAt.toISOString() : null,
      createdAt: saved.createdAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save letter' });
  }
});

// PUT: Update an existing letter (e.g. marking as opened or updating content)
app.put('/api/letters/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.openedAt) payload.openedAt = new Date(payload.openedAt);
    const updated = await Letter.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Letter not found' });
    res.json({
      id: updated._id.toString(),
      sender: updated.sender,
      recipient: updated.recipient,
      title: updated.title,
      content: updated.content,
      category: updated.category,
      signature: updated.signature || '',
      isOpened: updated.isOpened,
      openedAt: updated.openedAt ? updated.openedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update letter' });
  }
});

// DELETE: Remove a letter
app.delete('/api/letters/:id', async (req, res) => {
  try {
    const deleted = await Letter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Letter not found' });
    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete letter' });
  }
});

// GET: Spotify Track Metadata Auto-Detection (No Auth/OAuth required)
app.get('/api/spotify-metadata', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing Spotify URL' });
  }

  // Security: only allow valid Spotify track links
  const match = url.match(/\/track\/([a-zA-Z0-9]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid Spotify track URL format' });
  }

  const trackId = match[1];

  try {
    // 1. Try Spotify embed page (contains rich next_data with track name and artists list)
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
    const embedRes = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (embedRes.ok) {
      const html = await embedRes.text();
      const marker = '__NEXT_DATA__';
      const idx = html.indexOf(marker);
      if (idx !== -1) {
        const start = html.indexOf('>', idx) + 1;
        const end = html.indexOf('</script>', start);
        if (start > 0 && end > start) {
          const jsonStr = html.substring(start, end);
          const data = JSON.parse(jsonStr);
          const entity = data?.props?.pageProps?.state?.data?.entity;
          const title = entity?.name || entity?.title || '';
          const artist = (entity?.artists || []).map(a => a.name).filter(Boolean).join(', ');

          if (title) {
            return res.json({ title, artist });
          }
        }
      }
    }

    // 2. Fallback to public Spotify oEmbed
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${trackId}`)}`;
    const oembedRes = await fetch(oembedUrl);
    if (oembedRes.ok) {
      const odata = await oembedRes.json();
      if (odata && odata.title) {
        return res.json({ title: odata.title, artist: '' });
      }
    }

    return res.json({ title: '', artist: '' });
  } catch (err) {
    console.error('Spotify metadata fetch error:', err);
    return res.json({ title: '', artist: '' });
  }
});

// Export the app for Vercel Serverless
export default app;
