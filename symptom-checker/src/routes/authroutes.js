const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const tokenBlacklist = []; // In-memory blacklist (replace with Redis/DB for production)

router.post("/signout", authenticateToken, (req, res) => {
  const token = req.token; // The token being used by the user for authentication
  
  // Add token to blacklist
  if (!tokenBlacklist.includes(token)) {
    tokenBlacklist.push(token); // In-memory blacklist for now
    // In production, use Redis or a database like MongoDB to store the blacklist for persistence
  }

  res.status(200).json({ message: "Signed out successfully" });
});

module.exports = router;
