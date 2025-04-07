import React, { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({ age: "", gender: "" });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access context
export const useUser = () => useContext(UserContext);
