const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema & Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ In-memory token blacklist (for demo purposes only)
const tokenBlacklist = [];

// ✅ Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided." });
  }

  // 🚫 Check if token is blacklisted
  if (tokenBlacklist.includes(token)) {
    return res.status(403).json({ message: "Token has been invalidated." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token; // ✅ Set token on request for signout route
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// ✅ Signup Route
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, fullName: user.fullName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Signout Route
app.post("/api/signout", authenticateToken, (req, res) => {
  const token = req.token;
  if (!tokenBlacklist.includes(token)) {
    tokenBlacklist.push(token);
  }
  // Blacklist the token
  res.status(200).json({ message: "Signed out successfully" });
});

// ✅ User Info Route (Protected)
app.post("/api/userinfo", authenticateToken, (req, res) => {
  const { age, gender } = req.body;

  if (!age || !gender) {
    return res.status(400).json({ message: "Age and gender are required" });
  }

  res.status(200).json({
    message: "User info received successfully",
    data: { age, gender },
  });
});

// ✅ Prediction Route (Protected)
app.post("/api/predict", authenticateToken, async (req, res) => {
  const { age, gender, symptoms } = req.body;

  if (!age || !gender || !symptoms) {
    return res.status(400).json({ message: "All fields are required" });
  }

  res.status(200).json({
    prediction: "Prediction will come from Infermedica after API integration.",
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
