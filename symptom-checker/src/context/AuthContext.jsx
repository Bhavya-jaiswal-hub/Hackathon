import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!authToken;

  // ✅ Call this when user logs in successfully
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  };

  // ✅ Call this when user logs out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("authUser");

    if (token) {
      setAuthToken(token);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
