import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  permissions: {
    type: [String],
    default: ["read:alumni", "read:analytics"]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("ApiKey", apiKeySchema);