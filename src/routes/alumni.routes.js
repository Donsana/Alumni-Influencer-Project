import express from "express";
import { getAlumni } from "../controllers/alumni.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { trackUsage } from "../middleware/usage.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/alumni:
 *   get:
 *     summary: Get filtered alumni list
 *     tags: [Alumni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         example: CS
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2023
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         example: IT
 *     responses:
 *       200:
 *         description: Filtered alumni list returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: API key permission denied
 */
router.get("/", protect, checkPermission("read:alumni"), trackUsage, getAlumni);

export default router;