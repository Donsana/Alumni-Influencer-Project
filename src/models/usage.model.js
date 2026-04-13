import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  endpoint: String,
  method: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Usage", usageSchema);