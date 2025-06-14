import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);

        // ⏳ Wait 2 seconds to show animation before navigating
        setTimeout(() => {
          setShowSuccess(false); // hide animation (optional)
          navigate("/verify-otp", { state: { email } });
        }, 2000);
      } else {
        setErrorMessage(data.message || "❌ Something went wrong, please try again.");
      }
    } catch (error) {
      setErrorMessage("❌ Error during signup: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/healthcare-bg.jpg')" }}
      ></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Signup Form */}
      <motion.div
        className="relative z-20 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Sign Up</h2>

        {errorMessage && (
          <motion.p
            className="text-sm text-red-500 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        )}

        <motion.form className="space-y-4" onSubmit={handleSubmit} variants={containerVariants}>
          <motion.div variants={inputVariants}>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="input"
            />
          </motion.div>

          <motion.div variants={inputVariants}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="input"
            />
          </motion.div>

          <motion.div variants={inputVariants}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input"
            />
          </motion.div>

          <motion.div variants={inputVariants}>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="input"
            />
          </motion.div>

          <motion.div variants={inputVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-red"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Signing Up..." : "Create Account"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* ✅ Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-xl rounded-xl px-6 py-4 text-green-600 flex flex-col items-center"
          >
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl"
            >
              ✅
            </motion.div>
            <p className="text-lg font-semibold mt-2">OTP sent! Please check your email.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupForm;
