// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  email: { type: String },
  code: { type: String },
  verified: { type: Boolean, default: false },
  sentAt: { type: Date },
  expiresAt: { type: Date }
});

export default mongoose.model('User', userSchema);
