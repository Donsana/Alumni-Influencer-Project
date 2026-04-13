import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  token: String,
  type: String, // verify or reset
  expiresAt: Date
});

export default mongoose.model("Token", tokenSchema);