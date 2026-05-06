import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "won", "lost"],
    default: "pending"
  },
  isWinner: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

bidSchema.index({ userId: 1 });
bidSchema.index({ date: -1 });
bidSchema.index({ status: 1 });

export default mongoose.model("Bid", bidSchema);