import jwt from "jsonwebtoken";
import Blacklist from "../models/blacklist.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ message: "Invalid token" });
      }

      // CHECK BLACKLIST
      const isBlacklisted = await Blacklist.findOne({ token });

      if (isBlacklisted) {
        return res.status(401).json({ message: "Token revoked" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.id;

      next();
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    // cleaner log
    console.log("Auth error:", error.message);

    res.status(401).json({ message: "Invalid token" });
  }
};