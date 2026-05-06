import ApiKey from "../models/apikey.model.js";

// Middleware factory used to restrict API access based on API key permissions
// Example: read:analytics for analytics routes, read:alumni for alumni routes
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const key = req.headers["x-api-key"];

      if (!key) {
        return res.status(401).json({ message: "API key required" });
      }

      // Validate that the API key exists and has not been revoked
      const apiKey = await ApiKey.findOne({ key, isActive: true });

      if (!apiKey) {
        return res.status(403).json({ message: "Invalid API key" });
      }

      // Ensure the API key has permission to access the requested resource
      if (!apiKey.permissions.includes(permission)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};