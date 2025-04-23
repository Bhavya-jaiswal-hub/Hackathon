const jwt = require("jsonwebtoken");

// Make sure this list exists and is shared where needed
const tokenBlacklist = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.includes(token)) {
    return res.status(400).json({ message: "Invalid token." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ message: "Invalid token." });
    }

    req.token = token;  // ✅ Required for signout
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, tokenBlacklist };
