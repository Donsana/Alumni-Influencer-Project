import Usage from "../models/usage.model.js";

// Retrieve API usage statistics for the authenticated user
export const getUsageStats = async (req, res) => {
  try {
  // Count total API requests made by the user
    const count = await Usage.countDocuments({ userId: req.user });

   // Return usage count as response
    res.json({ count });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};