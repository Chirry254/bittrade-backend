import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password, wallet: 0 });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'User registration failed' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Trade Route
app.post('/api/trade', async (req, res) => {
  const { username, amount } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wallet += amount;
    await user.save();
    res.json({ message: 'Trade successful', wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ error: 'Trade failed' });
  }
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('✅ BitTrade Backend is Live!');
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
