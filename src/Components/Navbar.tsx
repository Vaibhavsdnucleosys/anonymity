import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaHome,
  FaSearch,
  FaPencilAlt,
  FaChartBar,
  FaQuestionCircle,
  FaUser,
  FaBookmark,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { getUserInfoFromToken } from "../Utils/decodeToken";
import Logo from "../assets/NCSLogo.jpg";

const Navbar = () => {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [email, setEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      const user = getUserInfoFromToken(token);
      if (user) {
        setEmail(user.Email);
        setIsLoggedIn(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleProfileDropdown = () => {
    setProfileDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (!isLoggedIn) {
      alert("Please sign in with Google or email to access this feature");
      return;
    }
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavigation = (path: string) => {
    if (!isLoggedIn) {
      alert("Please sign in with Google or email to access this feature");
      return;
    }
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full px-4 py-2 flex justify-between items-center">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <img src={Logo} alt="Logo" className="h-10 w-auto" />
        <a
          href="#"
          className="flex items-center font-bold text-lg md:text-2xl"
          style={{ color: '#3a0ca3' }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <FaChalkboardTeacher className="mr-2" />
          Anonymity
        </a>
      </div>

      {/* Center Nav Links */}
      <ul className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
        <li>
          <button
            onClick={() => handleNavigation("/")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "home" ? "text-[#3a0ca3]" : ""
              }`}
          >
            <FaHome /> Home
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("browseSchools")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "browseSchools" ? "text-[#3a0ca3]" : ""
              }`}
          >
            <FaSearch /> Browse Schools
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("review")}
            className="flex items-center gap-1 hover:text-[#3a0ca3]"
          >
            <FaPencilAlt /> Write Review
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("statistics")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "statistics" ? "text-[#3a0ca3]" : ""
              }`}
          >
            <FaChartBar /> Statistics
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("faq")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "faq" ? "text-[#3a0ca3]" : ""
              }`}
          >
            <FaQuestionCircle /> FAQ
          </button>
        </li>
      </ul>

      {/* Right Section (User Avatar) */}
      <div className="relative" ref={dropdownRef}>
        {isLoggedIn ? (
          <>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleProfileDropdown}>
              <span className="hidden sm:inline text-sm text-gray-700 font-semibold">Welcome, {email}</span>
              <div className="w-9 h-9 bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] text-white rounded-full flex justify-center items-center font-bold hover:scale-105 transition-transform">
                <FaUser />
              </div>
            </div>
            {profileDropdown && (
              <ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border text-gray-800 z-50">
                <li>
                  <button 
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleNavigation("/profile")}
                  >
                    <FaUser className="mr-2" /> My Profile
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleNavigation("/saved")}
                  >
                    <FaBookmark className="mr-2" /> Saved Reports
                  </button>
                </li>
                <li className="border-t">
                  <button
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </li>
              </ul>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="text-[#4361ee] font-semibold hover:text-[#3a0ca3] hover:underline"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;