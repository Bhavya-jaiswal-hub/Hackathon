import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(emailFromState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Please enter both email and OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ OTP verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "❌ OTP verification failed. Try again.");
      }
    } catch (err) {
      setError("❌ An error occurred while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f1f2f6] px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl text-center">
        {/* Image */}
        <img
          src="/bannerimage2.jpg" // Replace with your image URL if needed
          alt="OTP Illustration"
          className="w-40 h-40 mx-auto mb-6"
        />

        {/* Title and subtitle */}
        <h2 className="text-2xl font-bold text-black mb-2">OTP Verification</h2>
        <p className="text-gray-500 text-sm mb-6">We will send you a One Time Password on this email</p>

        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">OTP</label>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP"
              className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition duration-300"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
