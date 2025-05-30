import React, { useState, useEffect } from "react";
import GoogleLoginButton from "../../Pages/Auth/GoogleLoginButton";
import {
  FaSearch,
  FaPencilAlt,
  FaSchool,
  FaMapMarkerAlt,
  FaStar,
  FaStarHalfAlt,
  FaQuestionCircle as FaQuestion,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaInfoCircle,
  FaEdit,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaUserCircle,
  // FaUser, // No longer directly used by Home for profile rendering
  // FaBookmark, // No longer directly used by Home for profile rendering
  // FaSignOutAlt, // No longer directly used by Home for profile rendering
  FaUserPlus,
  FaSignInAlt
} from "react-icons/fa";
import { GoogleOAuthProvider } from "@react-oauth/google";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { login, logout } from "../Auth/AuthService"; // Assuming login is for email/pass
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../API/apiConfig";

interface UserData {
  email: string;
  userName?: string;
  profilePicture?: string;
  authProvider?: string;
}

const Home = () => {
  const [, setActiveSection] = useState("home");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For login errors

  // Registration state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState(""); // For registration errors
  const [registerSuccess, setRegisterSuccess] = useState(""); // For registration success message

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null); // Still needed for the welcome message
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false); // No longer needed in Home.tsx
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUserData = JSON.parse(user) as UserData;
        setIsLoggedIn(true);
        setUserData(parsedUserData); // Keep for welcome message
      } catch (e) {
        console.error("Failed to parse user data", e);
        // Call the main handleLogout, which will also update sessionStorage and dispatch event
        handleLogout();
      }
    } else { // Ensure state is reset if no token/user
        setIsLoggedIn(false);
        setUserData(null);
    }

    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // useEffect to handle scrolling to the auth section and adding animation
  useEffect(() => {
    if (location.state?.scrollToAuthSection && !isLoggedIn) {
      const authElement = document.getElementById("auth-login-forms");
      if (authElement) {
        authElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Wait for the smooth scroll to likely progress before starting the highlight
        setTimeout(() => {
          authElement.classList.add("highlight-animation");
          // Remove the class after the animation duration
          setTimeout(() => {
            authElement.classList.remove("highlight-animation");
          }, 1500); // Corresponds to the animation duration (1.5s)

          // Clear the navigation state after initiating the scroll and animation
          const { scrollToAuthSection, ...restState } = location.state || {};
          if (location.state?.scrollToAuthSection) {
             navigate(location.pathname, { replace: true, state: restState });
          }
        }, 500); // Delay to allow smooth scroll to progress (adjust as needed)

      } else {
        // If element not found but state exists, clear state to prevent issues
        if (location.state?.scrollToAuthSection) {
          const { scrollToAuthSection, ...restState } = location.state;
          navigate(location.pathname, { replace: true, state: restState });
        }
      }
    }
  }, [location.state, isLoggedIn, navigate, location.pathname]);


  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedState("");
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  // handleLogout is still needed if it can be triggered from within Home,
  // or if Home needs to react to its own auth state changes.
  // If logout is ONLY triggered from Navbar, this could be removed from Home
  // BUT it's generally good for Home to manage its own immediate auth state.
  const handleLogout = () => {
    logout(); // This should clear session/local storage and axios headers
    setIsLoggedIn(false);
    setUserData(null);
    // setIsDropdownOpen(false); // No longer needed
    navigate("/");
    window.dispatchEvent(new Event('storage')); // Notify Navbar and other components
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegisterError("");
    setRegisterSuccess("");

    try {
      const loggedInData = await login(email, password);

      const userProfile = {
        email: loggedInData.email,
        userName: loggedInData.userName || loggedInData.email.split('@')[0],
        profilePicture: loggedInData.profilePicture || '',
        authProvider: 'email'
      };

      setIsLoggedIn(true);
      setUserData(userProfile);
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      // Token is set by AuthService.login, Axios headers also set there

      navigate("/");
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setError("");
      setRegisterError("");
      setRegisterSuccess("");
      const googleToken = credentialResponse.credential;

      if (!googleToken || typeof googleToken !== 'string') {
        throw new Error("Invalid Google credential received");
      }

      const decodedGoogleToken = jwtDecode(googleToken) as any;

      if (decodedGoogleToken.exp! * 1000 < Date.now()) {
        throw new Error("Google token expired - please try again");
      }

      const response = await axios.post(API_ENDPOINTS.GoogleLogin, {
        token: googleToken
      });

      if (!response.data?.token) {
        throw new Error("No token received from backend");
      }

      const backendToken = response.data.token;
      const apiUserData = response.data.user;

      const userProfile = {
        email: apiUserData.email,
        userName: apiUserData.userName || decodedGoogleToken.name || apiUserData.email.split('@')[0],
        profilePicture: decodedGoogleToken.picture || '',
        authProvider: 'Google'
      };

      sessionStorage.setItem("token", backendToken);
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      axios.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;

      setIsLoggedIn(true);
      setUserData(userProfile);

      navigate('/');
      window.dispatchEvent(new Event('storage'));

    } catch (error: any) {
      console.error('Google login failed:', error);
      setError(error.message || "Login failed. Please try again.");
      // Consider if logout should be called here, might clear a partially valid session.
      // If backend fails after Google auth, the token might still be in session storage.
      // handleLogout(); // Or a more specific cleanup
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setError("");

    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterError("All fields are required.");
      return;
    }
    if (registerPassword.length < 6) {
        setRegisterError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.Register, {
        userName: registerName,
        email: registerEmail,
        password: registerPassword,
        authProvider: "email"
      });

      console.log("Registration successful:", response.data);
      setRegisterSuccess("Registration successful! Please login.");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setIsRegistering(false);

    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        if (err.response.data.errors && err.response.data.errors.AuthProvider) {
            setRegisterError(err.response.data.errors.AuthProvider[0]);
        } else if (err.response.data.message) {
            setRegisterError(err.response.data.message);
        } else if (err.response.data.title) {
            const errorMessages = Object.values(err.response.data.errors || {}).flat();
            setRegisterError(errorMessages.join(' ') || err.response.data.title);
        } else {
            setRegisterError("Registration failed. Please try again.");
        }
      } else if (err.message) {
        setRegisterError(err.message);
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    }
  };

  // renderProfileSection function REMOVED

  return (
    <div className="font-poppins bg-[#f5f7ff] min-h-screen flex flex-col">
      {/* renderProfileSection() call REMOVED */}

      <section className="bg-white flex items-start justify-center px-4 pt-0 md:pt-0 pb-4 h-screen">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 animate-fadeIn">
          <div className="flex-1 hidden md:block animate-fadeInLeft">
            <img
              src="/src/img/steptodown.com243970.jpg" // Ensure this path is correct
              alt="Left Illustration"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          <div className="flex-1 max-w-md w-full text-center animate-fadeInUp">
            <h1
              className="leading-snug mb-2 break-words"
              style={{ fontSize: '1.4rem', color: '#3a0ca3', fontWeight: 'bold' }}
            >
              A Clearer View of Schools — <br />Powered by Anonymous Reports
            </h1>
            <p className="text-gray-600 text-sm md:text-base mb-6">
              By continuing, you agree to our
              <a href="#" className="text-[#4361ee] font-medium hover:underline mx-1">Terms of Use</a> and
              <a href="#" className="text-[#4361ee] font-medium hover:underline ml-1">Privacy Policy</a>.
            </p>

            {!isLoggedIn ? (
              <div className="mt-6">
                {isRegistering ? (
                  // REGISTRATION VIEW
                  <>
                    <h2 className="text-xl font-semibold text-[#3a0ca3] mb-6 text-center">Create Your Account</h2>
                    <form className="space-y-4" onSubmit={handleRegister}>
                      {registerError && (
                        <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">
                          {registerError}
                        </div>
                      )}
                      {registerSuccess && (
                        <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">
                          {registerSuccess}
                        </div>
                      )}
                      <div>
                        <label htmlFor="registerName" className="sr-only">Name</label>
                        <input
                          id="registerName"
                          type="text"
                          placeholder="Enter your name"
                          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="registerEmail" className="sr-only">Email</label>
                        <input
                          id="registerEmail"
                          type="email"
                          placeholder="Enter your email"
                          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="registerPassword" className="sr-only">Password</label>
                        <input
                          id="registerPassword"
                          type="password"
                          placeholder="Enter your password"
                          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
                      >
                        Register
                      </button>
                    </form>
                    <div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2">
                      <span className="text-md">Already have an account?</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsRegistering(false);
                          setError("");
                          setRegisterError("");
                          setRegisterSuccess("");
                        }}
                        className="flex items-center gap-1 text-[#4361ee] font-semibold"
                      >
                        <FaSignInAlt className="mr-1" />
                        <span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">
                          Login here
                        </span>
                      </a>
                    </div>
                  </>
                ) : (
                  // LOGIN VIEW
                  <div id="auth-login-forms" className="p-2 rounded-lg"> {/* Added ID and some padding/rounding for the animation target */}
                    {registerSuccess && (
                        <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">
                          {registerSuccess}
                        </div>
                      )}
                    <div className="flex flex-col gap-3 mb-6">
                      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                        <GoogleLoginButton
                          onSuccess={handleGoogleLoginSuccess}
                          onError={() => {
                            setError("Google login failed. Please try again.");
                            setRegisterError("");
                            setRegisterSuccess("");
                          }}
                        />
                      </GoogleOAuthProvider>
                    </div>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500">or</span>
                      </div>
                    </div>
                    <form className="space-y-4" onSubmit={handleEmailLogin}>
                      {error && (
                        <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">
                          {error}
                        </div>
                      )}
                      <div>
                        <label htmlFor="loginEmail" className="sr-only">Email</label>
                        <input
                          id="loginEmail"
                          type="email"
                          placeholder="Enter your email"
                          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="loginPassword" className="sr-only">Password</label>
                        <input
                          id="loginPassword"
                          type="password"
                          placeholder="Enter your password"
                          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
                      >
                        Continue with Email
                      </button>
                    </form>
                    <div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2">
                      <span className="text-md">Don't have an account?</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsRegistering(true);
                          setError("");
                          setRegisterError("");
                          setRegisterSuccess("");
                        }}
                        className="flex items-center gap-1 text-[#4361ee] font-semibold"
                      >
                        <FaUserPlus className="mr-1" />
                        <span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">
                          Register here
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Logged In View
              <div className="text-center animate-fadeIn">
                <div className="flex justify-center mb-4">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-[#4361ee]"
                    />
                  ) : (
                    <FaUserCircle className="text-6xl text-gray-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-[#3a0ca3] mb-2">
                  Welcome {userData?.userName || userData?.email.split('@')[0]}!
                </h2>
                <p className="text-gray-600 mb-6">You're now logged in and can access all features</p>
                <button
                  onClick={() => scrollToSection("browseSchools")}
                  className="btn-primary bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Browse Schools
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 hidden md:block animate-fadeInRight">
            <img
              src="/src/img/steptodown.com659970.jpg" // Ensure this path is correct
              alt="Right Illustration"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Main Content - Only show when logged in */}
      {isLoggedIn && (
        <div className="main-content flex-grow py-10">
           <div className="container text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#3a0ca3] animate-fadeIn">
              Welcome to Guest Teacher Report
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto px-4 animate-fadeIn animate-delay-200">
              An honest review platform for guest teachers, aides, and support staff visiting
              schools across USA and Canada.
            </p>
            <button
              className="btn-primary mt-6 bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all animate-fadeIn animate-delay-300"
            >
              <FaPencilAlt className="mr-2" />Write a Review
            </button>
          </div>

          <section id="browseSchools" className="container my-12 animate-fadeIn animate-delay-400">
            <h3 className="text-center mb-8 font-semibold text-xl">Search for Schools or Teachers</h3>
            <form id="searchForm" className="search-form bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto border border-gray-100">
              <div className="row g-3 mb-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="schoolYear" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    School Year
                  </label>
                  <select
                    id="schoolYear"
                    className="form-select w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                  >
                    <option>Select School Year</option>
                    <option>2024-2025</option>
                    <option>2023-2024</option>
                    <option>2022-2023</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="schoolName" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    className="form-control w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                    placeholder="Enter school name"
                  />
                </div>
              </div>

              <div className="row g-3 mb-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teacherName" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    Teacher Name (First or Last)
                  </label>
                  <input
                    type="text"
                    id="teacherName"
                    className="form-control w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                    placeholder="Enter teacher name"
                  />
                  <small className="text-gray-500 text-sm">Note: Only teachers mentioned in previous reports will be found</small>
                </div>
                <div>
                  <label htmlFor="schoolLevel" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    School Level
                  </label>
                  <select
                    id="schoolLevel"
                    className="form-select w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                  >
                    <option>Select School Level</option>
                    <option>Elementary</option>
                    <option>Middle/Jr</option>
                    <option>High School</option>
                    <option>Preparatory</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    className="form-select w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                  >
                    <option>Select Country</option>
                    <option>USA</option>
                    <option>Canada</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="state" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                    State/Province
                  </label>
                  <select
                    id="state"
                    className="form-select w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                    value={selectedState}
                    onChange={handleStateChange}
                  >
                    <option>Select State/Province</option>
                    {selectedCountry === "USA" && (
                      <>
                        <option>California</option>
                        <option>Texas</option>
                        <option>New York</option>
                      </>
                    )}
                    {selectedCountry === "Canada" && (
                      <>
                        <option>Ontario</option>
                        <option>Quebec</option>
                        <option>British Columbia</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="city" className="form-label block font-semibold text-[#3a0ca3] mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  className="form-control w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 transition-all"
                  placeholder="Enter city name"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary bg-[#4361ee] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all inline-flex items-center"
                >
                  <FaSearch className="mr-2" /> Search
                </button>
              </div>
            </form>
          </section>

          <section id="statistics" className="container my-12 animate-fadeIn animate-delay-500">
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-semibold text-lg">Search Results</h5>
              <div className="text-gray-500">Showing 4 of 127 schools</div>
            </div>

            <div className="mb-6 p-3 bg-gray-100 border rounded-lg">
              <strong className="block mb-2">School Rating Categories</strong>
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Great (90-100%)
                </span>
                <span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Good (80-89%)
                </span>
                <span className="badge bg-yellow-500 text-gray-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Average (70-79%)
                </span>
                <span className="badge bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Below avg (60-69%)
                </span>
                <span className="badge bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Not recommended (50-59%)
                </span>
                <span className="badge bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaQuestion className="mr-1" />Not enough info
                </span>
              </div>
            </div>

            <div className="school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-blue-500 bg-blue-50/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h5 className="text-lg font-semibold mb-1 flex items-center">
                    <FaSchool className="text-blue-600 mr-2" />Montclair Middle School
                  </h5>
                  <small className="text-gray-500 flex items-center">
                    <FaMapMarkerAlt className="mr-1" />Middle/Jr • Montclair, CA
                  </small>
                </div>
                <div className="text-right">
                  <span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Good school for Guest Teachers!
                  </span>
                  <div className="mt-2">
                    <strong>Grade: 83% B-</strong>
                    <div className="inline-flex items-center ml-2">
                      {[...Array(4)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                      <FaStarHalfAlt className="text-yellow-400 text-sm" />
                      <span className="ml-1 text-sm text-gray-600">(24 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <a href="#" className="text-[#4361ee] font-semibold hover:text-[#3a0ca3] hover:underline mr-4 inline-flex items-center">
                  <FaInfoCircle className="mr-1" />View Details
                </a>
                <a href="#" className="text-[#4361ee] font-semibold hover:text-[#3a0ca3] hover:underline inline-flex items-center">
                  <FaEdit className="mr-1" />Submit Report
                </a>
              </div>
            </div>

            <div className="school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-green-500 bg-green-50/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h5 className="text-lg font-semibold mb-1 flex items-center">
                    <FaSchool className="text-green-600 mr-2" />Lincoln Elementary School
                  </h5>
                  <small className="text-gray-500 flex items-center">
                    <FaMapMarkerAlt className="mr-1" />Elementary • Lincoln, CA
                  </small>
                </div>
                <div className="text-right">
                  <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Great school for Guest Teachers!
                  </span>
                  <div className="mt-2">
                    <strong>Grade: 92% A-</strong>
                    <div className="inline-flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">(18 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <a href="#" className="text-[#4361ee] font-semibold hover:text-[#3a0ca3] hover:underline mr-4 inline-flex items-center">
                  <FaInfoCircle className="mr-1" />View Details
                </a>
                <a href="#" className="text-[#4361ee] font-semibold hover:text-[#3a0ca3] hover:underline inline-flex items-center">
                  <FaEdit className="mr-1" />Submit Report
                </a>
              </div>
            </div>

            <nav className="mt-8">
              <ul className="pagination flex justify-center gap-1">
                <li className="page-item disabled">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium hover:bg-blue-50">
                    <FaAngleDoubleLeft />
                  </button>
                </li>
                <li className="page-item active">
                  <button className="page-link px-3 py-1 rounded-lg bg-[#4361ee] text-white font-medium">1</button>
                </li>
                <li className="page-item">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium hover:bg-blue-50">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium hover:bg-blue-50">3</button>
                </li>
                <li className="page-item disabled">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium">...</button>
                </li>
                <li className="page-item">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium hover:bg-blue-50">10</button>
                </li>
                <li className="page-item">
                  <button className="page-link px-3 py-1 rounded-lg text-[#3a0ca3] font-medium hover:bg-blue-50">
                    <FaAngleDoubleRight />
                  </button>
                </li>
              </ul>
            </nav>
          </section>
        </div>
      )}

      <footer className="bg-gradient-to-br from-[#3a0ca3] to-[#212529] text-white py-8">
        <div className="container">
          <div className="footer-links flex flex-wrap justify-center gap-4 mb-6">
            <a href="#" className="hover:text-blue-200 transition">About Us</a>
            <a href="#" className="hover:text-blue-200 transition">How It Works</a>
            <a href="#" className="hover:text-blue-200 transition">FAQ</a>
            <a href="#" className="hover:text-blue-200 transition">Contact</a>
            <a href="#" className="hover:text-blue-200 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-200 transition">Terms of Service</a>
          </div>
          <div className="social-icons flex justify-center gap-3 mb-6">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition"><FaFacebookF /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition"><FaTwitter /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition"><FaLinkedinIn /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition"><FaInstagram /></a>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-center md:text-left">
            <div className="text-sm">© 2025 Anonymity. All rights reserved.</div>
            <div className="text-sm md:text-right">Made with @Nucleosys Tech Pvt. Ltd.</div>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-fadeIn { opacity: 0; animation: fadeIn 0.6s ease forwards; }
        .animate-delay-200 { animation-delay: 0.2s; }
        .animate-delay-300 { animation-delay: 0.4s; }
        .animate-delay-400 { animation-delay: 0.6s; }
        .animate-delay-500 { animation-delay: 0.8s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-primary { position: relative; overflow: hidden; z-index: 1; }
        .btn-primary::before { content: ''; position: absolute; top: 0; left: 0; width: 0; height: 100%; background-color: #3a0ca3; transition: width 0.3s ease; z-index: -1; }
        .btn-primary:hover::before { width: 100%; }

        /* New animation for highlighting the auth section */
        @keyframes highlight-auth-section {
          0% {
            box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); /* Start with no shadow */
            /* transform: scale(1); */
          }
          50% {
            box-shadow: 0 0 20px 8px rgba(58, 12, 163, 0.35); /* Peak shadow, color: #3a0ca3 */
            /* transform: scale(1.01); */
          }
          100% {
            box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); /* End with no shadow */
            /* transform: scale(1); */
          }
        }
        .highlight-animation {
          animation: highlight-auth-section 1.5s ease-in-out;
          /* Ensure the element is block or inline-block for box-shadow to apply correctly */
          /* The target #auth-login-forms is already a div, so this should be fine. */
          /* Added padding and border-radius to #auth-login-forms directly for better visual */
        }
      `}</style>
    </div>
  );
};

export default Home;