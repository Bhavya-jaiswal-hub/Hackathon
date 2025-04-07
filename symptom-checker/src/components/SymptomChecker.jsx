import React, { useState } from "react";
import { useUser } from "../context/usercontext"; // ✅ Access user age/gender

function SymptomChecker() {
  const { userData } = useUser(); // age, gender
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState("");

  const handlePredict = () => {
    if (!symptoms) {
      alert("Please enter your symptoms.");
      return;
    }

    // 🔮 Dummy prediction for now (replace with real logic/backend later)
    setPrediction("You may have a common cold. Stay hydrated and rest.");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
        Symptom Checker
      </h2>

      <p className="text-gray-700 mb-2">Age: {userData.age}</p>
      <p className="text-gray-700 mb-4">Gender: {userData.gender}</p>

      <textarea
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        rows="4"
        placeholder="Describe your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      ></textarea>

      <button
        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition duration-300"
        onClick={handlePredict}
      >
        Predict Disease
      </button>

      {prediction && (
        <div className="mt-6 bg-green-100 p-4 rounded-md text-green-800">
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;
