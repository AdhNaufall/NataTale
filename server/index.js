import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images

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
  createdAt: { type: Date, default: Date.now }
});

const Memory = mongoose.model('Memory', memorySchema);

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
      rating: m.rating
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

// Start Server
app.listen(PORT, () => {
  console.log(`NataTale Backend is running on http://localhost:${PORT}`);
});
