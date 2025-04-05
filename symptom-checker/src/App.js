import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroImage from "./components/HeroImage";
import AgeInput from "./components/AgeInput";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import { AuthProvider } from "./context/AuthContext"; // ✅ Import AuthProvider

function App() {
  return (
    // ✅ Wrap the whole app inside AuthProvider
    <AuthProvider>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />

        {/* Routes */}
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
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
