import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/api/forgot-password", { email });
    setMessage(res.data.message);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Send Reset Link</button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
