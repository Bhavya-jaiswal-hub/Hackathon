const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://hackathon-tau-bay.vercel.app",
  credentials: true,
}));
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "symptomcheckercluster",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ------------------ Nodemailer Transport ------------------
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------ User Schema ------------------
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
});

const User = mongoose.model("User", userSchema);

// ------------------ JWT Middleware ------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token." });

    req.user = user;
    next();
  });
};

// ------------------ Routes ------------------

// ✅ Disease Prediction (Protected Route)
app.post('/api/predict', authenticateToken, async (req, res) => {
  try {
    const { age, gender, symptoms, height, weight, medicalHistory, currentMedications, allergies, lifestyle } = req.body;

    // Prepare the request body with default empty values if not provided
    const apiBody = {
      symptoms: symptoms || [],  // Default to empty array if symptoms are not provided
      patientInfo: {
        age: age,
        gender: gender,
        height: height || null,  // Default to null if height is not provided
        weight: weight || null,  // Default to null if weight is not provided
        medicalHistory: medicalHistory || [],  // Default to empty array if not provided
        currentMedications: currentMedications || [],  // Default to empty array if not provided
        allergies: allergies || [],  // Default to empty array if not provided
        lifestyle: lifestyle || {}  // Default to empty object if not provided
      },
      lang: "en"  // Language parameter
    };

    console.log("Received data:", req.body);

    const response = await axios.post(
      'https://ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com/ai-medical-diagnosis-api-symptoms-to-results',
      apiBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com'
        }
      }
    );

    // Send the prediction result back to the client
    res.json({ prediction: response.data.response });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: 'Prediction failed. Please try again.' });
  }
});


// ✅ Signup - Send Verification Email
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const token = jwt.sign(
      { fullName, email, password },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const verificationLink = `https://hackathon-tau-bay.vercel.app/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Hello ${fullName},</p>
             <p>Click the link below to verify your email and complete your signup:</p>
             <a href="${verificationLink}">${verificationLink}</a>
             <p>This link expires in 15 minutes.</p>`
    });

    res.status(200).json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Verify Email
app.post("/api/verify-email", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { fullName, email, password } = decoded;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Email verified and user created!" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token", error: err.message });
  }
});

// ✅ Email/Password Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, fullName: user.fullName, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Forgot Password
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    const expiry = Date.now() + 3600000;

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetLink = `https://hackathon-tau-bay.vercel.app/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Reset Password
app.post("/api/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token });

    if (!user || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Send OTP for Login
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP for Login",
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ OTP Login
app.post("/api/login-with-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, fullName: user.fullName, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "OTP login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global error handler:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
