import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { v4 as uuidv4 } from "uuid";
import Token from "../models/token.model.js";
import crypto from "crypto";
import ResetToken from "../models/resetToken.model.js";
import { validationResult } from "express-validator";
import Blacklist from "../models/blacklist.model.js";
import { sendEmail } from "../utils/email.js";

// Register a new user or resend verification if user exists but not verified
export const register = async (req, res) => {
  try {
  // Validate incoming request data (email & password)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Restrict registration to IIT domain emails only
    if (!email.endsWith("@iit.ac.lk")) {
      return res.status(400).json({ message: "Use university email" });
    }
    // Check if user already exists in the database
    const existingUser = await User.findOne({ email });

    // Handle existing user: resend verification if not verified
    if (existingUser) {

      // IF NOT VERIFIED → RESEND TOKEN
      if (!existingUser.isVerified) {

      // Generate unique verification token (crypto)
        const token = crypto.randomBytes(32).toString("hex");

      // Store verification token with expiry (1 hour)
        await Token.create({
          userId: existingUser._id,
          token,
          type: "verify",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60)
        });

        // Send verification email containing token link
        sendEmail(
          existingUser.email,
          "Verify Your Email",
          `Your verification token is: ${token}\n\nClick or use this:\nhttp://localhost:5000/api/auth/verify/${token}`
        );

        console.log("Resent verify token:", token);

        return res.json({
          message: "Verification email resent",
          token
        });
      }

      // IF ALREADY VERIFIED
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password securely before storing in database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user record in database
    const user = await User.create({
      email,
      password: hashedPassword
    });

    // CREATE VERIFICATION TOKEN
    const token = crypto.randomBytes(32).toString("hex");

    await Token.create({
      userId: user._id,
      token,
      type: "verify",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60)
    });

    // SEND EMAIL
    sendEmail(
      user.email,
      "Verify Your Email",
      `Your verification token is: ${token}\n\nClick or use this:\nhttp://localhost:5000/api/auth/verify/${token}`
    );

    console.log("Verify token:", token);

    res.status(201).json({
      message: "Registered successfully",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Authenticate user and generate JWT token
export const login = async (req, res) => {
  try {
  // Validate login input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

        // Ensure user has verified their email before allowing login
        if (!user.isVerified) {
          return res.status(400).json({ message: "Please verify your email" });
        }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token for authenticated session
    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify user email using verification token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    // Retrieve verification token from database
    const foundToken = await Token.findOne({ token });

    if (!foundToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // Check if token has expired
    if (foundToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }
    // Find user associated with token
    const user = await User.findById(foundToken.userId);

    user.isVerified = true;
    await user.save();
    // Remove token after successful verification
    await Token.deleteOne({ _id: foundToken._id });

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Generate password reset token and send via email
export const requestPasswordReset = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Remove any existing reset tokens for this user
    await ResetToken.deleteMany({ userId: user._id });
    // Generate secure random reset token
    const token = crypto.randomBytes(32).toString("hex");
    // Store reset token with expiry (1 hour)
    await ResetToken.create({
      userId: user._id,
      token,
      type: "reset",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60)
    });

    // Send password reset token to user's email
    sendEmail(
      user.email,
      "Reset Your Password",
      `Your reset token is: ${token}`
    );

    // ALSO LOG
    console.log("Reset token:", token);

    res.json({ message: "Password reset token generated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Reset user password using valid reset token
export const resetPassword = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Find reset token in database
    const reset = await ResetToken.findOne({ token });
    if (!reset) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // Check if reset token is expired
    if (reset.expiresAt && reset.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const user = await User.findById(reset.userId);
    // Hash new password before saving
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    // Delete reset token after successful password update
    await ResetToken.deleteOne({ _id: reset._id });

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Logout user by blacklisting JWT token
export const logout = async (req, res) => {
  try {
  // Extract JWT token from Authorization header
    const token = req.headers.authorization.split(" ")[1];

   // Store token in blacklist to prevent reuse
    await Blacklist.create({ token });

    res.json({ message: "Logged out successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};