const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const tokenBlacklist = []; // In-memory blacklist (replace with Redis/DB for production)

router.post("/signout", authenticateToken, (req, res) => {
  const token = req.token;
  if (!tokenBlacklist.includes(token)) {
    tokenBlacklist.push(token);
  }
  res.status(200).json({ message: "Signed out successfully" });
});

// ✅ Add forgot-password route here
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log("Received forgot password request for:", email);

  // For now just send a simple response
  res.status(200).json({ message: "Reset link sent to email!" });
});

module.exports = router;
