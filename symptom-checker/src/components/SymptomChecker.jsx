import { useState, useEffect } from "react";
import { useUser } from "../context/usercontext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;


function SymptomChecker() {
  const { userData } = useUser();
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState("");

  // ✅ Get current location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          setLocationError("Location access denied. Please allow location to find nearby hospitals.");
        }
      );
    } else {
      setLocationError("Geolocation not supported by your browser.");
    }
  }, []);

  const handlePredict = async () => {
    const trimmedSymptoms = symptoms
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (!userData.age || !userData.gender) {
      alert("Missing age or gender.");
      return;
    }

    if (trimmedSymptoms.length === 0) {
      alert("Please enter at least one symptom.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/predict`, {
        age: userData.age,
        gender: userData.gender,
        symptoms: trimmedSymptoms,
      });

      setPrediction(res.data.prediction || res.data.message);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNearbyHospitals = () => {
    if (location.latitude && location.longitude) {
      navigate(`/nearby-hospitals?lat=${location.latitude}&lng=${location.longitude}`);
    } else {
      alert("Location not available. Please enable location access.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Symptom Checker</h2>

      {/* ✅ Age & Gender Display */}
      <div className="mb-4 text-gray-700">
        <p><strong>Age:</strong> {userData.age}</p>
        <p><strong>Gender:</strong> {userData.gender}</p>
      </div>

      {/* ✅ Location Status */}
      {location.latitude && location.longitude ? (
        <p className="text-green-600 text-sm mb-4">
          📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      ) : (
        <p className="text-red-500 text-sm mb-4">{locationError}</p>
      )}

      {/* ✅ Symptom Input */}
      <textarea
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        rows="4"
        placeholder="Enter symptoms (e.g. fever, cough, headache)"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      {/* ✅ Predict Button */}
      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition"
      >
        {loading ? "Predicting..." : "Predict Disease"}
      </button>

      {/* ✅ Prediction Result */}
      {prediction && (
        <div className="mt-6 bg-green-100 text-green-800 p-4 rounded text-center shadow">
          <strong>Prediction:</strong> {prediction}
        </div>
      )}

      {/* ✅ Find Hospitals Button */}
      {prediction && (
        <button
          onClick={handleNearbyHospitals}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
        >
          Find Nearby Hospitals
        </button>
      )}
    </div>
  );
}

export default SymptomChecker;
