import React, { useState } from "react";
import { useUser } from "../context/usercontext";
import axios from "axios";

function SymptomChecker() {
  const { userData } = useUser();
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    if (!symptoms) {
      alert("Please enter your symptoms.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction("");

    try {
      const response = await axios.post(
        "https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com/chat?noqueue=1",
        {
          message: `Age: ${userData.age}, Gender: ${userData.gender}, Symptoms: ${symptoms}`,
          specialization: "general",
          language: "en"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": "a09d5dcf53mshd8ee663c0504d9p1ab5adjsn197284bdede1",
            "X-RapidAPI-Host": "ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com",
          },
        }
      );

      // Display the prediction from API
      setPrediction(response.data.response);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict Disease"}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 p-3 rounded-md text-red-700">
          {error}
        </div>
      )}

      {prediction && (
        <div className="mt-6 bg-green-100 p-4 rounded-md text-green-800">
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;
