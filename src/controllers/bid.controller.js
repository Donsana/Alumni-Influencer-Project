import Bid from "../models/bid.model.js";
import User from "../models/user.model.js";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/email.js";

// Place or update a bid for the current day with validation and business rules
export const placeBid = async (req, res) => {
  try {
  // Validate incoming bid amount
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    const { amount } = req.body;

   // Retrieve current user to check eligibility (monthly limits)
    const user = await User.findById(req.user);

    // Enforce monthly winning limit (max 3 wins per user)
    if (user.winsThisMonth >= 3) {
      return res.status(400).json({
        message: "Monthly limit reached"
      });
    }

    // Define today's date range (midnight to end of day)
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

   // Check if user already placed a bid today
    let bid = await Bid.findOne({
      userId: req.user,
      createdAt: { $gte: start, $lte: end }
    });

    // If bid exists, allow update only if new amount is higher
    if (bid) {
    // Prevent lowering or equal bid values
      if (amount <= bid.amount) {
        return res.status(400).json({
          message: "New bid must be higher than previous bid"
        });
      }
      // Update existing bid with higher amount
      bid.amount = amount;
      await bid.save();

      return res.json({
        message: "Bid updated",
        bid
      });
    }

    // Create a new bid for today if none exists
    bid = await Bid.create({
      userId: req.user,
      amount,
      status: "pending"
    });

    res.json({
      message: "Bid placed",
      bid
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Retrieve current user's bid for today
export const getMyBid = async (req, res) => {
// Define today's date range to filter bids
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // Fetch user's bid within today's range
  const bid = await Bid.findOne({
    userId: req.user,
    createdAt: { $gte: start, $lte: end }
  });

  if (!bid) {
    return res.json({ status: "no_bid" });
  }

  res.json({
    amount: bid.amount,
    status: bid.status
  });
};
// Select daily winning bid (highest amount) and update statuses
export const selectWinner = async () => {
  try {
    console.log("🔄 Running winner selection...");

    // Define yesterday's range because cron runs at midnight
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1);

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    // Retrieve all bids placed on the previous day
    const bids = await Bid.find({
      createdAt: { $gte: start, $lte: end }
    });

    console.log("Bids found:", bids.length);

    // Exit if no bids were placed today
    if (!bids.length) {
      console.log("❌ No bids found");
      return;
    }

    // Find highest bid using descending sort
    const highestBid = await Bid.findOne({
      createdAt: { $gte: start, $lte: end }
    }).sort({ amount: -1 });

    console.log("🏆 Highest bid:", highestBid.amount);

    // Mark all previous day's bids as lost before selecting winner
    await Bid.updateMany(
      { createdAt: { $gte: start, $lte: end } },
      { status: "lost", isWinner: false }
    );

   // Reset winner flag for all users
    await User.updateMany({}, { isWinner: false });
    // Mark highest bid as winner
    highestBid.status = "won";
    highestBid.isWinner = true;
    await highestBid.save();

    // Increment user's monthly wins and appearance count
    await User.findByIdAndUpdate(highestBid.userId, {
      $inc: {
          winsThisMonth: 1,
          appearanceCount: 1
        },
        isWinner: true
    });
    console.log("🏆 Winner selected:", highestBid.userId);

   // Retrieve winner user details for notification
    const winnerUser = await User.findById(highestBid.userId);

   // Send notification email to winning user
    await sendEmail(
      winnerUser.email,
      "🎉 You are the Alumni Influencer!",
      "Congratulations! You have been selected as today's featured alumni."
    );

  } catch (error) {
    console.error(error);
  }
};
// Get status (pending, won, lost) of user's current bid
export const getBidStatus = async (req, res) => {
  try {
  // Define today's range for filtering bid
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Retrieve today's bid for status check
    const bid = await Bid.findOne({
      userId: req.user,
      createdAt: { $gte: start, $lte: end }
    });

    if (!bid) {
      return res.json({ status: "no_bid" });
    }

    res.json({
      status: bid.status
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Retrieve all bids of the user sorted by latest first
export const getMyBids = async (req, res) => {
  try {
  // Fetch all bids placed by user
    const bids = await Bid.find({ userId: req.user })
      .sort({ createdAt: -1 });

    res.json(bids);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Cancel user's bid for the current day
export const cancelBid = async (req, res) => {
  try {
    const userId = req.user;

   // Define today's range to ensure only today's bid is deleted
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Delete today's bid if it exists
    const deleted = await Bid.findOneAndDelete({
      userId,
      createdAt: { $gte: start, $lte: end }
    });

   // Handle case where no bid exists for today
    if (!deleted) {
      return res.json({ message: "No bid to cancel today" });
    }

    res.json({ message: "Bid cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Retrieve total bids and wins for the user
export const getBidStats = async (req, res) => {
  try {
  // Count total bids placed by user
    const totalBids = await Bid.countDocuments({ userId: req.user });

   // Count total winning bids
    const wins = await Bid.countDocuments({
      userId: req.user,
      status: "won"
    });

    res.json({
      totalBids,
      wins
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Check if tomorrow's featured slot is available
export const getTomorrowSlot = async (req, res) => {
  try {
  // Calculate tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);

    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

   // Check if a winner already exists for tomorrow
    const existingWinner = await Bid.findOne({
      createdAt: { $gte: start, $lte: end },
      isWinner: true
    });

    res.json({
      available: !existingWinner
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Determine if user's current bid is leading compared to highest bid
export const getLiveBidStatus = async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // Get highest bid for today
  const highest = await Bid.findOne({
    createdAt: { $gte: start, $lte: end }
  }).sort({ amount: -1 });

  // Get current user's bid
  const myBid = await Bid.findOne({
    userId: req.user,
    createdAt: { $gte: start, $lte: end }
  });

  if (!myBid || !highest) {
    return res.json({ status: "no_bid" });
  }
  // Compare user's bid with highest bid to determine status
  res.json({
    status: myBid.amount >= highest.amount ? "winning" : "not_winning"
  });
};