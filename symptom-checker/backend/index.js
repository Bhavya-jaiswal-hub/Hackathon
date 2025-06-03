const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173", // for local frontend dev
  "https://hackathon-tau-bay.vercel.app", // your deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.options("*", cors());



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
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token." });

    req.user = user;
    next();
  });
};

// ✅ Symptom Prediction Route
app.post("/api/predict", async (req, res) => {
  const { age, gender, symptoms } = req.body;

  if (!age || !gender || !symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: "Missing or invalid input fields." });
  }

  try {
    const diseasePrediction = {
      "fever": "Flu",
      "headache": "Migraine",
      "cough": "Common Cold",
      "nausea": "Gastritis",
      "fatigue": "Chronic Fatigue Syndrome",
      "shortness of breath": "Asthma",
      "sore throat": "Strep Throat",
      "chest pain" : "pneumonia", 
      "vomiting" : "Food Poisoning",
      "diarrhea" : "Gastroenteritis",
      "rash" : "Allergic Reaction",
      "fever, chills" : "COVID - 19",
      "muscle pain" : "Influenza",
      "joint pain" : "Arthritis",
      "runny nose" : "Sinusitis"
    };

    let possibleDiseases = [];

    symptoms.forEach(symptom => {
      if (diseasePrediction[symptom.toLowerCase()]) {
        possibleDiseases.push(diseasePrediction[symptom.toLowerCase()]);
      }
    });

    if (possibleDiseases.length > 0) {
      return res.status(200).json({
        message: "Possible Diseases Based on Symptoms",
        prediction: possibleDiseases.join(", "),
      });
    } else {
      return res.status(200).json({
        message: "We couldn't find a match for your symptoms. Please consult a doctor for accurate diagnosis.",
      });
    }
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Failed to process prediction." });
  }
});

// ✅ Signup (OTP-based email verification)
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const newUser = new User({ fullName, email, password: hashedPassword, otp, otpExpiry });
    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email (OTP)',
      html: `<p>Hello ${fullName},</p>
             <p>Your OTP for email verification is: <b>${otp}</b></p>
             <p>This OTP will expire in 10 minutes.</p>`,
    });

    // Schedule deletion after 10 minutes if not verified
    setTimeout(async () => {
      const user = await User.findOne({ email });
      if (user && user.otp && Date.now() > user.otpExpiry) {
        await User.deleteOne({ email });
        console.log(`🗑️ Unverified user ${email} deleted due to expired OTP`);
      }
    }, 10 * 60 * 1000 + 1000);

    res.status(200).json({ message: "OTP sent to email. Please verify to complete signup." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Verify OTP
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified and user registered successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login
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

// ✅ OTP Login
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
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log("🛣️ Route:", middleware.route.path);
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
