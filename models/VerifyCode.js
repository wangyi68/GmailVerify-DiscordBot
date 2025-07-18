import mongoose from 'mongoose';

const verifyCodeSchema = new mongoose.Schema({
  discordId: String,
  email: String,
  code: String,
  verified: Boolean,
  sentAt: Number,
  expiresAt: Number
});

export default mongoose.model('VerifyCode', verifyCodeSchema);
