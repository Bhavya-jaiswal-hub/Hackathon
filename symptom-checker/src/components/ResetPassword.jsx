import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    const res = await axios.post(`http://localhost:5000/api/reset-password/${token}`, {
      newPassword,
    });
    setMessage(res.data.message);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-2 mt-4">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded">Reset Password</button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
