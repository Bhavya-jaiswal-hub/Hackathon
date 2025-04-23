import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, signout } = useAuth(); // ✅ Also get signout

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
            <h1>Symptom Checker</h1>
          </Link>
        </div>

        {/* Menu Icon (visible below lg breakpoint) */}
        <div className="lg:hidden ml-auto">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars className="text-red-500 text-2xl" />
          </button>
        </div>

        {/* Center Nav Items (visible on large screens only) */}
        <ul className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 text-gray-700 font-medium">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="px-3 py-1 hover:text-red-500 hover:underline underline-offset-4 transition-colors duration-300"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons (visible on large screens only) */}
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

      {/* Mobile & Tablet Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-md z-10">
          <ul className="flex flex-col items-center space-y-4 py-4">
            {navItems.map((item, index) => (
              <li key={index} className="w-full text-center">
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-gray-700 font-medium hover:text-red-500 hover:bg-red-100 transition-all duration-300 ease-in-out"
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {isAuthenticated ? (
              <>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Logout
                  </button>
                </li>
                <li>
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
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                  >
                    Login
                  </button>
                </li>
                <li>
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
