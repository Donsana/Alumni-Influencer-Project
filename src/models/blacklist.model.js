import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60
  }
});

export default mongoose.model("Blacklist", blacklistSchema);