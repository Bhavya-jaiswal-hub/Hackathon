import React, { useState,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

   // 👇 Add this useEffect to debug mode and step
  useEffect(() => {
    console.log("isOtpMode:", isOtpMode);
    console.log("step:", step);
  }, [isOtpMode, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) return alert("Please fill in all fields");

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Login successful!");
        login(data.token, { email });
        navigate("/");
      } else {
        alert("❌ " + (data.message || "Login failed"));
      }
    } catch (error) {
      alert("❌ Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return alert("Please enter your email");
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
     if (res.ok) {
  alert("📧 OTP sent to your email.");
  console.log("OTP mode activated, step set to 2");
  setStep(2);
}
 else {
        alert("❌ " + (data.message || "OTP sending failed"));
      }
    } catch (error) {
      alert("❌ Failed to send OTP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter OTP");
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login-with-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ OTP login successful!");
        login(data.token, { email: formData.email });
        navigate("/");
      } else {
        alert("❌ " + (data.message || "OTP verification failed"));
      }
    } catch (error) {
      alert("❌ OTP verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Login Form */}
      <motion.div
        className="relative z-20 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
          {isOtpMode ? "Login with OTP" : "Login"}
        </h2>

        {!isOtpMode ? (
          <motion.form className="space-y-4" onSubmit={handleLogin} variants={containerVariants}>
            <motion.input
              variants={inputVariants}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <motion.input
              variants={inputVariants}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
           <motion.button
  type="submit"
  disabled={loading}
  className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {loading ? (
    <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  ) : "Login"}
</motion.button>

          </motion.form>
        ) : (
          <motion.div
  key={`${isOtpMode}-${step}`}  // ⬅️ force re-render when state changes
  className="space-y-4"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>

            <motion.input
              variants={inputVariants}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {step === 1 ? (
             <motion.button
  onClick={handleSendOtp}
  disabled={loading}
  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {loading ? (
    <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  ) : "Send OTP"}
</motion.button>

            ) : (
              <motion.form className="space-y-4" onSubmit={handleVerifyOtp}>
                <motion.input
                  variants={inputVariants}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
               <motion.button
  type="submit"
  disabled={loading}
  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {loading ? (
    <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  ) : "Verify & Login"}
</motion.button>

              </motion.form>
            )}
          </motion.div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsOtpMode((prev) => !prev);
              setStep(1);
              setOtp("");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isOtpMode ? "← Login with password" : "Login with OTP instead"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
