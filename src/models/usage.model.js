import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  apiKey: String,
  endpoint: String,
  method: String,

  timestamp: {
    type: Date,
    default: Date.now
  }
});

usageSchema.index({ userId: 1 });
usageSchema.index({ apiKey: 1 });
usageSchema.index({ endpoint: 1 });
usageSchema.index({ timestamp: -1 });

export default mongoose.model("Usage", usageSchema);