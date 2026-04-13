import express from "express";
import { getUsageStats } from "../controllers/usage.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/usage:
 *   get:
 *     summary: Get API usage statistics
 *     tags: [Usage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage stats fetched
 */
router.get("/", protect, getUsageStats);

export default router;