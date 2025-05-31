import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
        alert("❌ " + data.message);
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
        setStep(2);
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Failed to send OTP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
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
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ OTP verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="relative min-h-screen flex items-center justify-center">
    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center z-0"
      style={{ backgroundImage: "url('/healthcare-bg.jpg')" }}
    ></div>

    {/* Optional dark overlay */}
    <div className="absolute inset-0 bg-black/40 z-10"></div>

    {/* Login Form */}
    <div className="relative z-20 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
        {isOtpMode ? "Login with OTP" : "Login"}
      </h2>

      {!isOtpMode ? (
        <form className="space-y-4" onSubmit={handleLogin}>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="input" />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-red">{loading ? "Logging in..." : "Login"}</button>
        </form>
      ) : (
        <div className="space-y-4">
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" />
          {step === 1 ? (
            <button onClick={handleSendOtp} disabled={loading} className="btn-blue">{loading ? "Sending OTP..." : "Send OTP"}</button>
          ) : (
            <>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="input" />
              <button onClick={handleVerifyOtp} disabled={loading} className="btn-green">{loading ? "Verifying..." : "Verify & Login"}</button>
            </>
          )}
        </div>
      )}

      <div className="text-center mt-4">
        <button onClick={() => { setIsOtpMode((prev) => !prev); setStep(1); setOtp(""); }} className="text-sm text-blue-600 hover:underline">
          {isOtpMode ? "← Login with password" : "Login with OTP instead"}
        </button>
      </div>
    </div>
  </div>
);


export default LoginForm;
