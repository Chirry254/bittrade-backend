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
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
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
    res.json({ message: 'Login successful', wallet: user.wallet, depositAddress: user.depositAddress });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Simulate a trade (bot)
app.post('/api/trade', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Simulate profit/loss between -30% to +80%
    const percent = (Math.random() * 1.1 - 0.3).toFixed(2);
    const result = user.wallet * percent;
    user.wallet += result;

    const trade = new Trade({ user: user._id, amount: user.wallet, result });
    await trade.save();
    await user.save();

    res.json({ message: `Trade ${result >= 0 ? 'profit' : 'loss'}: ${result.toFixed(4)} BTC`, wallet: user.wallet.toFixed(4) });
  } catch (err) {
    res.status(500).json({ error: 'Trade failed' });
  }
});

// Get trade history
app.get('/api/trades/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const trades = await Trade.find({ user: user._id }).sort({ timestamp: -1 }).limit(10);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch trade history' });
  }
});

// Post a message
app.post('/api/message', async (req, res) => {
  const { user, content } = req.body;
  try {
    const msg = new Message({ user, content });
    await msg.save();
    res.status(201).json({ message: 'Message posted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Get messages
app.get('/api/messages', async (_req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
  res.json(messages);
});

// Leaderboard
app.get('/api/leaderboard', async (_req, res) => {
  const topUsers = await User.find().sort({ wallet: -1 }).limit(5).select('username wallet');
  res.json(topUsers);
});

// Root test
app.get('/', (_req, res) => {
  res.send('✅ BitTrade Backend is Live!');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});

