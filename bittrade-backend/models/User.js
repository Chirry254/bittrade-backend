import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  wallet: Number
});

export default mongoose.model('User', userSchema);
