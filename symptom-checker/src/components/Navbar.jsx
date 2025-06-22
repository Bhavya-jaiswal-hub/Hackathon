import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, signout } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Check Symptoms", path: "/check" },
    { name: "Health Tips", path: "/tips" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleSignupClick = () => {
    navigate(location.pathname === "/signup" ? "/" : "/signup");
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate(location.pathname === "/login" ? "/" : "/login");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const handleSignout = async () => {
    await signout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 relative">
      <div className="relative flex items-center justify-between flex-wrap max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-red-500 font-bold text-xl flex-shrink-0">
          <Link to="/">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500">
              <span className="mr-2">|</span>
              <span>
                <Typewriter
                  words={["Symptom Checker"]}
                  loop={0}
                  cursor
                  cursorStyle="_"
                  typeSpeed={100}
                  deleteSpeed={60}
                  delaySpeed={1500}
                />
              </span>
            </h1>
          </Link>
        </div>

        {/* Menu Icon */}
        <div className="lg:hidden ml-auto">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars className="text-red-500 text-2xl" />
          </button>
        </div>

        {/* Desktop Nav Items */}
        <ul className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 text-gray-700 font-medium">
          {navItems.map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <Link
                to={item.path}
                className="px-3 py-1 hover:text-red-500 hover:underline underline-offset-4 transition-colors duration-300"
              >
                {item.name}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden lg:flex items-center space-x-4 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
              >
                Logout
              </button>
              <button
                onClick={handleSignout}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
              >
                Login
              </button>
              <button
                onClick={handleSignupClick}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-md z-10"
          >
            <ul className="flex flex-col items-center space-y-4 py-4">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.2, duration: 0.5, ease: "easeOut" }}
                  className="w-full text-center"
                >
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-gray-700 font-medium hover:text-red-500 hover:bg-red-100 transition-all duration-300 ease-in-out"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}

              {/* Auth buttons for mobile */}
              {isAuthenticated ? (
                <>
                  <li key="logout-button">
                    <button
                      onClick={handleLogout}
                      className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Logout
                    </button>
                  </li>
                  <li key="signout-button">
                    <button
                      onClick={handleSignout}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li key="login-button">
                    <button
                      onClick={handleLoginClick}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                    >
                      Login
                    </button>
                  </li>
                  <li key="signup-button">
                    <button
                      onClick={handleSignupClick}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                    >
                      Sign Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
