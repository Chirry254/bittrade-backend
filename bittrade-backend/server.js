import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import Trade from './models/Trade.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    'https://bittrade-delta.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Constant BTC deposit address
const BTC_ADDRESS = 'bc1qjrhku4yrvnrys7jq6532ar5a6m96k2mg8gwxx2';

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, depositAddress: BTC_ADDRESS });
    await user.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', wallet: user.wallet, depositAddress: BTC_ADDRESS });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Simulated trade
app.post('/api/trade', async (req, res) => {
  const { username, amount } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Simulate profit/loss between -30% and +80%
    const percent = (Math.random() * 1.1 - 0.3).toFixed(2);
    const result = amt * percent;
    user.wallet += result;

    const trade = new Trade({ user: user._id, amount: amt, result });
    await trade.save();
    await user.save();

    res.json({ message: `Trade ${result >= 0 ? 'profit' : 'loss'}: ${result.toFixed(4)} BTC`, wallet: user.wallet.toFixed(4) });
  } catch (err) {
    res.status(500).json({ error: 'Trade failed' });
  }
});

// Trade history
app.get('/api/trades/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const trades = await Trade.find({ user: user._id }).sort({ timestamp: -1 }).limit(10);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch trade history' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (_req, res) => {
  const topUsers = await User.find().sort({ wallet: -1 }).limit(5).select('username wallet');
  res.json(topUsers);
});

// Messages (optional feature)
app.get('/api/messages', async (_req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
  res.json(messages);
});

// Lightweight health check for uptime monitoring
app.get('/api/ping', (_req, res) => {
  res.status(200).send('pong');
});

// Root test
app.get('/', (_req, res) => {
  res.send('✅ BitTrade Backend is Live!');
});

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});


