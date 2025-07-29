import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  result: Number, // gain or loss
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Trade', tradeSchema);
