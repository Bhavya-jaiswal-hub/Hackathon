import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext"; // ✅ Updated

function AgeInput() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const { setUserData } = useUser(); // ✅ Updated
  const navigate = useNavigate();

  const ages = Array.from({ length: 100 }, (_, i) => i + 1);
  const genders = ["Male", "Female", "Other"];

  const handleContinue = () => {
    if (!age || !gender) {
      alert("Please select both age and gender.");
      return;
    }

    // ✅ Save to global context
    setUserData({ age, gender });

    // ✅ Navigate to symptom checker page
    navigate("/check");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-6 space-y-4">
      {/* Age Selection */}
      <div className="relative w-full">
        <input
          type="text"
          value={age}
          readOnly
          placeholder="Enter your age"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => setShowAgeDropdown(!showAgeDropdown)}
        />
        <FaChevronDown
          className="absolute right-3 top-3 text-gray-500 cursor-pointer"
          onClick={() => setShowAgeDropdown(!showAgeDropdown)}
        />
        {showAgeDropdown && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1 z-10">
            {ages.map((num) => (
              <li
                key={num}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setAge(num);
                  setShowAgeDropdown(false);
                }}
              >
                {num}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gender Selection */}
      <div className="relative w-full">
        <input
          type="text"
          value={gender}
          readOnly
          placeholder="Select your gender"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => setShowGenderDropdown(!showGenderDropdown)}
        />
        <FaChevronDown
          className="absolute right-3 top-3 text-gray-500 cursor-pointer"
          onClick={() => setShowGenderDropdown(!showGenderDropdown)}
        />
        {showGenderDropdown && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1 z-10">
            {genders.map((g) => (
              <li
                key={g}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setGender(g);
                  setShowGenderDropdown(false);
                }}
              >
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
      >
        Continue
      </button>
    </div>
  );
}

export default AgeInput;
