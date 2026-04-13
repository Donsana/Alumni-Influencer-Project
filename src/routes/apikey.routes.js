import express from "express";
import {
  generateApiKey,
  getApiKeys,
  revokeApiKey
} from "../controllers/apikey.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/apikey:
 *   post:
 *     summary: Generate API key
 *     tags: [API Key]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key generated
 */
router.post("/", protect, generateApiKey);
/**
 * @swagger
 * /api/apikey:
 *   get:
 *     summary: Get API keys
 *     tags: [API Key]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get("/", protect, getApiKeys);
/**
 * @swagger
 * /api/apikey/{id}/revoke:
 *   put:
 *     summary: Revoke API key
 *     tags: [API Key]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key revoked
 */
router.put("/:id/revoke", protect, revokeApiKey);

export default router;