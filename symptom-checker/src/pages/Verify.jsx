import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      const response = await fetch("https://hackathon-8rnn.onrender.com/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="text-center p-6">
      <h2 className="text-xl">{message}</h2>
    </div>
  );
}

export default Verify;
