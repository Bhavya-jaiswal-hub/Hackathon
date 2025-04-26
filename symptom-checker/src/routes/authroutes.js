const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User"); // Adjust the path if needed

const tokenBlacklist = []; // In-memory blacklist (replace with Redis/DB for production)

// ✅ Signout Route
router.post("/signout", authenticateToken, (req, res) => {
  const token = req.token;
  if (!tokenBlacklist.includes(token)) {
    tokenBlacklist.push(token);
  }
  res.status(200).json({ message: "Signed out successfully" });
});

// ✅ Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with that email not found" });
    }

    // Create a reset token (expires in 15 minutes)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to reset:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    console.log("Reset link sent to:", email);

    res.status(200).json({ message: "Reset link sent to email!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// ✅ Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
});

module.exports = router;
