import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroImage from "./components/HeroImage";
import AgeInput from "./components/AgeInput";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import SymptomChecker from "./components/SymptomChecker"; // ✅ Import this
import { AuthProvider } from "./context/AuthContext"; // ✅ Import AuthProvider

function App() {
  return (
    <AuthProvider>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroImage />
                <AgeInput />
              </>
            }
          />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/check" element={<SymptomChecker />} /> {/* ✅ Add this route */}
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
