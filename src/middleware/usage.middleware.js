import Usage from "../models/usage.model.js";

export const trackUsage = async (req, res, next) => {
  try {
    if (req.user) {
      await Usage.create({
        userId: req.user,
        apiKey: req.headers["x-api-key"] || "No API key",
        endpoint: req.path.replace("/", ""),
        method: req.method
      });
    }
  } catch (err) {
    console.log(err);
  }

  next();
};