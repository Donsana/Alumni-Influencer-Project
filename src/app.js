import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cron from "node-cron";
import { selectWinner } from "./controllers/bid.controller.js";
import User from "./models/user.model.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import bidRoutes from "./routes/bid.routes.js";
import usageRoutes from "./routes/usage.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { trackUsage } from "./middleware/usage.middleware.js";
import rateLimit from "express-rate-limit";
import apiKeyRoutes from "./routes/apikey.routes.js";



dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use(limiter);
app.use(trackUsage);

connectDB();


app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/keys", apiKeyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Daily winner selection (midnight)
cron.schedule("0 0 * * *", () => {
  console.log("Running daily winner selection...");
  selectWinner();
}, {
  timezone: "Asia/Colombo"
});

// Monthly reset (1st day of month)
cron.schedule("0 0 1 * *", async () => {
  console.log("Resetting monthly wins...");

  await User.updateMany({}, {
    winsThisMonth: 0,
    appearanceCount: 0
  });
}, {
  timezone: "Asia/Colombo"
});