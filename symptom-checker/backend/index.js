const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const fetch = require("node-fetch");
const axios = require("axios");
const router = express.Router();
const CryptoJS = require("crypto-js");

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
// app.options("*", cors({ origin: allowedOrigins, credentials: true })); // Define explicitly




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

// Sample static hospital data (replace with your real data or DB later)
const hospitals = [
  {
    id: "1",
    name: "City Hospital",
    address: "123 Main St",
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: "2",
    name: "Greenwood Clinic",
    address: "456 Elm St",
    latitude: 40.7157,
    longitude: -74.0150,
  },
  {
    id: "3",
    name: "Lakeside Medical Center",
    address: "789 Pine St",
    latitude: 40.7306,
    longitude: -73.9866,
  },
];

// Haversine formula helper function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get("/api/hospitals/nearby", async (req, res) => {
  const { latitude, longitude, location } = req.query;

  let userLat, userLon;

  if (latitude && longitude) {
    userLat = parseFloat(latitude);
    userLon = parseFloat(longitude);
  } else if (location) {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: location,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "SymptomCheckerApp/1.0",
        },
      });

      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      userLat = parseFloat(response.data[0].lat);
      userLon = parseFloat(response.data[0].lon);
    } catch (error) {
      console.error("Geocoding error:", error.message);
      return res.status(500).json({ error: "Failed to fetch coordinates from location" });
    }
  } else {
    return res.status(400).json({
      error: "Provide either latitude and longitude or a location name",
    });
  }

  // Fetch hospitals from Overpass API
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:10000,${userLat},${userLon});
      way["amenity"="hospital"](around:10000,${userLat},${userLon});
      relation["amenity"="hospital"](around:10000,${userLat},${userLon});
    );
    out center;
  `;

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: { "Content-Type": "text/plain" },
      }
    );

    const data = response.data.elements.map((el) => {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      return {
        name: el.tags.name || "Unnamed Hospital",
        latitude: lat,
        longitude: lon,
        distance: getDistanceFromLatLonInKm(userLat, userLon, lat, lon),
      };
    });

    const sorted = data.sort((a, b) => a.distance - b.distance);

    res.json({ hospitals: sorted });
  } catch (error) {
    console.error("Overpass API error:", error.message);
    res.status(500).json({ error: "Failed to fetch hospitals from Overpass API" });
  }
});


// Nearby hospitals endpoint
// app.get("/api/hospitals/nearby", (req, res) => {
//   const { latitude, longitude } = req.query;

//   if (!latitude || !longitude) {
//     return res.status(400).json({ error: "latitude and longitude query params required" });
//   }

//   const userLat = parseFloat(latitude);
//   const userLon = parseFloat(longitude);

//   // Calculate distance to each hospital
//   const hospitalsWithDistance = hospitals.map((hospital) => {
//     const distance = getDistanceFromLatLonInKm(
//       userLat,
//       userLon,
//       hospital.latitude,
//       hospital.longitude
//     );
//     return { ...hospital, distance };
//   });

//   // Filter hospitals within 10 km radius (adjust as needed)
//   const nearbyHospitals = hospitalsWithDistance
//     .filter((h) => h.distance <= 10)
//     .sort((a, b) => a.distance - b.distance);

//   res.json({ hospitals: nearbyHospitals });
// });

// app.get("/api/hospitals/nearby", async (req, res) => {
//   const { latitude, longitude } = req.query;

//   if (!latitude || !longitude) {
//     return res.status(400).json({ error: "latitude and longitude query params required" });
//   }

//   const radius = 5000; // in meters (5 km)

//   const query = `
//     [out:json];
//     (
//       node["amenity"="hospital"](around:${radius},${latitude},${longitude});
//       way["amenity"="hospital"](around:${radius},${latitude},${longitude});
//       relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
//     );
//     out center;
//   `;

//   try {
//     const response = await fetch("https://overpass-api.de/api/interpreter", {
//       method: "POST",
//       body: query,
//       headers: { "Content-Type": "text/plain" },
//     });

//     const data = await response.json();

//     const hospitals = data.elements.map((el) => ({
//       id: el.id,
//       name: el.tags?.name || "Unnamed Hospital",
//       latitude: el.lat || el.center?.lat,
//       longitude: el.lon || el.center?.lon,
//       address: el.tags?.["addr:full"] ||
//                el.tags?.["addr:street"] ||
//                el.tags?.["addr:city"] ||
//                "No address available",
//     }));

//     res.json({ hospitals });
//   } catch (err) {
//     console.error("Overpass API error:", err.message);
//     res.status(500).json({ error: "Failed to fetch hospitals from Overpass API" });
//   }
// });

// Load your Sandbox credentials from .env


// Start server

// // ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global error handler:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});
// Catch-all route handler (MUST be last)
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});




// app._router.stack.forEach((middleware) => {
//   if (middleware.route) {
//     console.log("🛣️ Route:", middleware.route.path);
//   }
// });

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});