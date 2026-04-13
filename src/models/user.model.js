import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  winsThisMonth: {
    type: Number,
    default: 0
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  appearanceCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);