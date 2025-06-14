import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SignupSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/verify-otp", { state: { email } }); // Pass email to OTP page
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [navigate, email]);

  return (
    <div className="min-h-screen bg-red-600 flex flex-col justify-center items-center text-white px-4 text-center">
      <div className="text-6xl sm:text-7xl animate-bounce mb-6">📨</div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">OTP Sent!</h1>
      <p className="text-sm sm:text-base">
        Please check your email. Redirecting to OTP verification...
      </p>
    </div>
  );
};

export default SignupSuccess;
