import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroImage from "./components/HeroImage";
import AgeInput from "./components/AgeInput";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import SymptomChecker from "./components/SymptomChecker";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ PrivateRoute component
const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

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

          {/* ✅ Protected route */}
          <Route
            path="/check"
            element={<PrivateRoute element={<SymptomChecker />} />}
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
