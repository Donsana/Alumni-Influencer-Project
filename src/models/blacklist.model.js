import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: String
});

export default mongoose.model("Blacklist", blacklistSchema);