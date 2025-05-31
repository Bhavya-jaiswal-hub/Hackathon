import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        alert("✅ OTP sent to your email. Please verify.");
        navigate("/verify-otp", { state: { email } });
      } else {
        setErrorMessage(data.message || "❌ Something went wrong, please try again.");
      }
    } catch (error) {
      setErrorMessage("❌ Error during signup: " + error.message);
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

    {/* Signup Form */}
    <div className="relative z-20 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Sign Up</h2>
      {errorMessage && <p className="text-sm text-red-500 mb-4">{errorMessage}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="input" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input" />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="input" />
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="input" />
        <button type="submit" disabled={loading} className="btn-red">{loading ? "Signing Up..." : "Create Account"}</button>
      </form>
    </div>
  </div>
);


export default SignupForm;
