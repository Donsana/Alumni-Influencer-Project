import ApiKey from "../models/apikey.model.js";
import crypto from "crypto";

// Generate a secure API key for the authenticated user
export const generateApiKey = async (req, res) => {
  try {
  // Generate a random 48-character hexadecimal API key
    const key = crypto.randomBytes(24).toString("hex");

   // Store API key in database linked to user
    const apiKey = await ApiKey.create({
      userId: req.user._id || req.user,
      key,
      permissions: ["read:alumni", "read:analytics"]
    });

  // Return generated API key to client
    res.json({
      _id: apiKey._id,
      key: apiKey.key,
      permissions: apiKey.permissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve all API keys belonging to the user
export const getApiKeys = async (req, res) => {
// Fetch user's API keys sorted by latest first
  const keys = await ApiKey.find({ userId: req.user })
  .sort({ createdAt: -1 });
  // Return list of API keys
  res.json(keys);
};
// Revoke (deactivate) an API key owned by the user
export const revokeApiKey = async (req, res) => {
  try {
  // Extract API key ID from request parameters
    const { id } = req.params;

   // Retrieve API key from database
    const key = await ApiKey.findById(id);

    // Validate that API key exists
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }

    // Ensure user owns the API key (authorization check)
    if (key.userId.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

   // Prevent revoking an already inactive key
    if (!key.isActive) {
      return res.status(400).json({ message: "Key already revoked" });
    }

   // Mark API key as inactive (revoked)
    key.isActive = false;
    // Save updated key status to database
    await key.save();

   // Return success response
    res.json({ message: "API key revoked" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};