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
  FaSignInAlt // <<<< Make sure FaSignInAlt is imported
} from "react-icons/fa";
import axios from "axios";
import { logout as authServiceLogout } from "../Pages/Auth/AuthService";
import Logo from "../assets/NCSLogo.jpg";
import { toast } from "sonner";


interface UserData {
  email: string;
  userName?: string;
  profilePicture?: string;
  authProvider?: string;
}

const Navbar = () => {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuthStatus = () => {
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData: UserData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserName(userData.userName || userData.email.split('@')[0]);
        setProfilePicture(userData.profilePicture);
        if (axios.defaults.headers.common['Authorization'] !== `Bearer ${token}`) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Navbar: Failed to parse user data from sessionStorage", e);
        setIsLoggedIn(false);
        setUserName("");
        setProfilePicture(undefined);
        delete axios.defaults.headers.common['Authorization'];
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setProfilePicture(undefined);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };
    window.addEventListener('storage', handleStorageChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    const wasLoggedIn = sessionStorage.getItem("token") !== null;
    authServiceLogout();
    setProfileDropdown(false);
    window.dispatchEvent(new Event('storage'));
    navigate("/", { replace: true });
    if (wasLoggedIn) {
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to access this feature.");
      navigate("/");
      return;
    }
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        targetSection?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleNavigation = (path: string) => {
    if ((path === "/profile" || path === "/saved") && !isLoggedIn) {
      toast.error("Please sign in to access this feature.");
      navigate("/");
      return;
    }
    if (path === "/") {
      setActiveSection("home");
    }
    navigate(path);
    setProfileDropdown(false);
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
            handleNavigation("/");
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
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "home" ? "text-[#3a0ca3]" : ""}`}
          >
            <FaHome /> Home
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("browseSchools")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "browseSchools" ? "text-[#3a0ca3]" : ""}`}
          >
            <FaSearch /> Browse Schools
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                toast.error("Please sign in to write a review.");
                navigate("/");
                return;
              }
              handleNavigation("/write-review");
            }}
            className="flex items-center gap-1 hover:text-[#3a0ca3]"
          >
            <FaPencilAlt /> Write Review
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollToSection("statistics")}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "statistics" ? "text-[#3a0ca3]" : ""}`}
          >
            <FaChartBar /> Statistics
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                toast.error("Please sign in to access FAQ.");
                navigate("/");
                return;
              }
              scrollToSection("faq");
            }}
            className={`flex items-center gap-1 hover:text-[#3a0ca3] ${activeSection === "faq" ? "text-[#3a0ca3]" : ""}`}
          >
            <FaQuestionCircle /> FAQ
          </button>
        </li>
      </ul>

      {/* Right Section (User Avatar/Sign In) */}
      <div className="relative" ref={dropdownRef}>
        {isLoggedIn ? (
          <>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setProfileDropdown(prev => !prev)}>
              <span className="hidden sm:inline text-sm text-gray-700 font-semibold">
                {userName}
              </span>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-indigo-100 object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] text-white rounded-full flex justify-center items-center font-bold hover:scale-105 transition-transform">
                  <FaUser />
                </div>
              )}
            </div>
            {profileDropdown && (
              <ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border text-gray-800 z-50">
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100 text-left"
                    onClick={() => handleNavigation("/profile")}
                  >
                    <FaUser className="mr-2" /> My Profile
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100 text-left"
                    onClick={() => handleNavigation("/saved")}
                  >
                    <FaBookmark className="mr-2" /> Saved Reports
                  </button>
                </li>
                <li className="border-t">
                  <button
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100 text-left"
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
            onClick={() => {
              navigate("/", { state: { scrollToAuthSection: true } });
              setActiveSection("home");
            }}
            style={{ borderRadius: "12px" }}
            className="
    relative flex items-center justify-center gap-1
    text-[#4361ee]
    font-semibold py-2 px-5 text-sm
    transition-colors duration-300 ease-in-out
    hover:text-[#3a0ca3]
    focus:outline-none focus:ring-2 focus:ring-[#4361ee]/70 focus:ring-offset-1
  "
          >
            <FaSignInAlt />
            Sign In
            <span
              className="
      absolute bottom-2 left-5 right-5 h-[2px] bg-[#3a0ca3]
      scale-x-0 origin-left
      transition-transform duration-300 ease-in-out
      hover:scale-x-100
      pointer-events-none
    "
            />
          </button>


        )}
      </div>
    </nav>
  );
};

export default Navbar;