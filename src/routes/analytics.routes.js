import express from "express";
import {
  getJobStats,
  getCertificationStats,
  getCompanyStats,
  getBidTrends,
  getUsageStatsAll,
  getIndustryStats,
  getYearStats,
  getLocationStats,
  getSummaryStats
} from "../controllers/analytics.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { trackUsage } from "../middleware/usage.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics/jobs:
 *   get:
 *     summary: Get job title distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job statistics returned
 */
router.get("/jobs", protect, checkPermission("read:analytics"), trackUsage, getJobStats);

/**
 * @swagger
 * /api/analytics/certifications:
 *   get:
 *     summary: Get certification provider statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certification statistics returned
 */
router.get("/certifications", protect, checkPermission("read:analytics"), trackUsage, getCertificationStats);

/**
 * @swagger
 * /api/analytics/companies:
 *   get:
 *     summary: Get top employer statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company statistics returned
 */
router.get("/companies", protect, checkPermission("read:analytics"), trackUsage, getCompanyStats);

/**
 * @swagger
 * /api/analytics/bids:
 *   get:
 *     summary: Get bid trend statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid trend statistics returned
 */
router.get("/bids", protect, checkPermission("read:analytics"), trackUsage, getBidTrends);

/**
 * @swagger
 * /api/analytics/usage:
 *   get:
 *     summary: Get API usage statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API usage statistics returned
 */
router.get("/usage", protect, checkPermission("read:analytics"), trackUsage, getUsageStatsAll);

/**
 * @swagger
 * /api/analytics/industry:
 *   get:
 *     summary: Get industry distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Industry statistics returned
 */
router.get("/industry", protect, checkPermission("read:analytics"), trackUsage, getIndustryStats);

/**
 * @swagger
 * /api/analytics/years:
 *   get:
 *     summary: Get graduation year distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Graduation year statistics returned
 */
router.get("/years", protect, checkPermission("read:analytics"), trackUsage, getYearStats);

/**
 * @swagger
 * /api/analytics/locations:
 *   get:
 *     summary: Get geographic distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Location statistics returned
 */
router.get("/locations", protect, checkPermission("read:analytics"), trackUsage, getLocationStats);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary statistics returned
 */
router.get("/summary", protect, checkPermission("read:analytics"), trackUsage, getSummaryStats);

export default router;