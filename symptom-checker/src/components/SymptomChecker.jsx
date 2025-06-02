import { useState, useEffect } from "react";
import { useUser } from "../context/usercontext";
import axios from "axios";
import ResultDisplay from "./ResultDisplay";

function SymptomChecker() {
  const { userData } = useUser();
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState("");

  const isUserInfoComplete = userData.age && userData.gender;

  // Get geolocation on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          setLocationError("Could not access your location. Please allow location access.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handlePredict = async () => {
    if (!symptoms) {
      alert("Please enter your symptoms.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await axios.post("https://hackathon-8rnn.onrender.com/api/predict", {
        age: userData.age,
        gender: userData.gender,
        symptoms: symptoms.split(",").map((s) => s.trim()),
        location, // Send location to backend (optional for now)
      });

      if (response.data.prediction) {
        setPrediction(response.data.prediction);
      } else {
        setError("Could not get prediction. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
        Symptom Checker
      </h2>

      <p className="text-gray-700 mb-1">Age: {userData.age || "Not provided"}</p>
      <p className="text-gray-700 mb-2">Gender: {userData.gender || "Not provided"}</p>

      {location.latitude && location.longitude && (
        <p className="text-green-700 text-sm mb-4">
          📍 Your Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      )}

      {locationError && (
        <p className="text-red-500 text-sm mb-4">{locationError}</p>
      )}

      {!isUserInfoComplete ? (
        <div className="text-red-500 text-center font-semibold">
          Please enter your age and gender in your profile before using the Symptom Checker.
        </div>
      ) : (
        <>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="4"
            placeholder="Describe your symptoms (comma-separated, e.g. headache, fever, fatigue)..."
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
        </>
      )}

      {error && (
        <div className="mt-4 bg-red-100 p-3 rounded-md text-red-700">{error}</div>
      )}

      {prediction && <ResultDisplay prediction={prediction} />}
    </div>
  );
}

export default SymptomChecker;
