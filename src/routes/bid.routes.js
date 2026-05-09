import express from "express";
import { placeBid, getMyBid, getMyBids, cancelBid, getBidStats, getBidStatus, getTomorrowSlot } from "../controllers/bid.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { body } from "express-validator";

const router = express.Router();

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Place a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             amount: 500
 *     responses:
 *       200:
 *         description: Bid placed
 */

router.post(
  "/",
  protect,
  [
    body("amount")
      .isNumeric().withMessage("Amount must be a number")
      .isFloat({ gt: 0 }).withMessage("Amount must be greater than 0")
  ],
  placeBid
);
/**
 * @swagger
 * /api/bids/me:
 *   get:
 *     summary: Get my bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bid fetched
 */

router.get("/me", protect, getMyBid);
/**
 * @swagger
 * /api/bids/all:
 *   get:
 *     summary: Get all user bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bids list
 */
router.get("/all", protect, getMyBids);
/**
 * @swagger
 * /api/bids/status:
 *   get:
 *     summary: Get current bid status
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid status
 */
router.get("/status", protect, getBidStatus);
/**
 * @swagger
 * /api/bids:
 *   delete:
 *     summary: Cancel current bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid cancelled
 *       404:
 *         description: No bid found
 */
router.delete("/", protect, cancelBid);
/**
 * @swagger
 * /api/bids/stats:
 *   get:
 *     summary: Get bidding statistics
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched
 */
router.get("/stats", protect, getBidStats);
/**
 * @swagger
 * /api/bids/slot:
 *   get:
 *     summary: Get tomorrow slot availability
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Slot info
 */
router.get("/slot", protect, getTomorrowSlot);

export default router;