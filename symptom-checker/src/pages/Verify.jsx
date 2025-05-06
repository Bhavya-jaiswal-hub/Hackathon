import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const [message, setMessage] = useState("Verifying...");
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Error state for catching errors
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setError("No token found in the URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://hackathon-8rnn.onrender.com/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || "✅ Email verified successfully!");
          setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
        } else {
          setMessage(data.message || "❌ Verification failed. Please try again.");
        }
      } catch (error) {
        setError("❌ An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center p-6">
        {loading ? (
          <h2 className="text-xl font-semibold">Verifying your email...</h2>
        ) : error ? (
          <h2 className="text-xl text-red-500">{error}</h2>
        ) : (
          <h2 className="text-xl">{message}</h2>
        )}
      </div>
    </div>
  );
}

export default Verify;
