import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wallet: { type: Number, default: 0 },
  depositAddress: { type: String, default: 'bc1qjrhku4yrvnrys7jq6532ar5a6m96k2mg8gwxx2' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
