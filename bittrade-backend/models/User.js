import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  wallet: { type: Number, default: 0 },
  depositAddress: { type: String },
});

export default mongoose.model('User', userSchema);

