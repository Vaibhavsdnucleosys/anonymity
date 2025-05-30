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
  FaInstagram
} from "react-icons/fa";
import { GoogleOAuthProvider } from "@react-oauth/google";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { login, logout } from "../Auth/AuthService";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../API/apiConfig";

const Home = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

 useEffect(() => {
  const token = sessionStorage.getItem("token");
  const user = sessionStorage.getItem("user");
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserEmail(userData.email);
    } catch (e) {
      console.error("Failed to parse user data", e);
      logout();
    }
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
  }, [navigate]);

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
const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const userData = await login(email, password); // Your login function

    setIsLoggedIn(true);
    setUserEmail(userData.email);

    // ✅ Navigate after successful login
    navigate("/"); // or "/profile" or wherever you want

    window.dispatchEvent(new Event('storage'));
  }catch (error: any) {
  console.error("Login error (full):", error);
}

};



const handleGoogleLoginSuccess = async (credentialResponse: any) => {
  try {
    setError(""); // Clear previous errors
    
    // 1. Get the credential from the response
    const googleToken = credentialResponse.credential;
    
    if (!googleToken || typeof googleToken !== 'string') {
      throw new Error("Invalid Google credential received");
    }

    // 2. Immediately decode the Google credential to check validity
    const decodedGoogleToken = jwtDecode(googleToken);
    console.log("Decoded Google token:", decodedGoogleToken);

    if (decodedGoogleToken.exp! * 1000 < Date.now()) {
      throw new Error("Google token expired - please try again");
    }

    // 3. Send to your backend
    const response = await axios.post(API_ENDPOINTS.GoogleLogin, {
      token: googleToken // Send just the token string
    });

    console.log("Backend response:", response.data);

    // 4. Handle backend response
    if (!response.data?.token) {
      throw new Error("No token received from backend");
    }

    const backendToken = response.data.token;
    const userData = response.data.user;

    // 5. Store session
    sessionStorage.setItem("token", backendToken);
    sessionStorage.setItem("user", JSON.stringify({
      email: userData.email,
      userName: userData.userName,
      authProvider: 'Google'
    }));

    // 6. Set axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;

    // 7. Update state
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    
    // 8. Show welcome message
    alert(`Welcome ${userData.userName}!`);
    
    // 9. Navigate
    navigate('/');
    window.dispatchEvent(new Event('storage'));
    
  } catch (error) {
    console.error('Google login failed:', error);
    setError("Login failed. Please try again.");
    
    // Clean up on error
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
  }
};
  return (
      <div className="font-poppins bg-[#f5f7ff] min-h-screen flex flex-col">
      {/* Navbar will be rendered here by your layout */}
      
      <section className="bg-white flex items-start justify-center px-4 pt-0 md:pt-0 pb-4 h-screen">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 animate-fadeIn">
          {/* Left Illustration */}
          <div className="flex-1 hidden md:block animate-fadeInLeft">
            <img
              src="/src/img/steptodown.com243970.jpg"
              alt="Left Illustration"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          {/* Login Content */}
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
              <>
                {/* Show login form when not logged in */}
                <div className="flex flex-col gap-3 mb-6">
                  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <GoogleLoginButton
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => setError("Google login failed. Please try again.")}
                    />
                  </GoogleOAuthProvider>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">or</span>
                  </div>
                </div>

                {/* Email Login Form */}
                <form className="space-y-4" onSubmit={handleEmailLogin}>
                  {error && (
                    <div className="text-red-500 text-sm mb-2">
                      {error}
                    </div>
                  )}
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-full border border-gray-300 px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-full border border-gray-300 px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-5 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee] mb-4"
                    style={{ borderRadius: '9999px' }}
                  >
                    Continue with Email
                  </button>
                </form>
                
                {/* Register Link */}
                <div className="mt-4 animate-fadeIn text-base text-gray-700 flex items-center justify-center gap-2">
                  <span className="text-lg">Don't have an account?</span>
                  <a href="#" className="flex items-center gap-1 text-[#4361ee] font-semibold">
                    <i className="fas fa-user-plus"></i>
                    <span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">
                      Register here
                    </span>
                  </a>
                </div>
              </>
            ) : (
              /* Show welcome message when logged in */
              <div className="text-center animate-fadeIn">
                <h2 className="text-2xl font-bold text-[#3a0ca3] mb-2">Welcome back!</h2>
                <p className="text-gray-600 mb-6">You're logged in as {userEmail}</p>
                <button
                  onClick={() => scrollToSection("browseSchools")}
                  className="btn-primary bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Browse Schools
                </button>
              </div>
            )}
          </div>

          {/* Right Illustration */}
          <div className="flex-1 hidden md:block animate-fadeInRight">
            <img
              src="/src/img/steptodown.com659970.jpg"
              alt="Right Illustration"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>


      {/* Main Content */}
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

        {/* Browse Schools Section */}
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

        {/* Statistics Section */}
        <section id="statistics" className="container my-12 animate-fadeIn animate-delay-500">
          <div className="flex justify-between items-center mb-6">
            <h5 className="font-semibold text-lg">Search Results</h5>
            <div className="text-gray-500">Showing 4 of 127 schools</div>
          </div>

          {/* Legend */}
          <div className="mb-6 p-3 bg-gray-100 border rounded-lg">
            <strong className="block mb-2">School Rating Categories</strong>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <FaStar className="mr-1" />Great (90-100%)
              </span>
              <span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <FaStar className="mr-1" />Good (80-89%)
              </span>
              <span className="badge bg-yellow-500 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                <FaStar className="mr-1" />Average (70-79%)
              </span>
              <span className="badge bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                <FaStar className="mr-1" />Below avg (60-69%)
              </span>
              <span className="badge bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <FaStar className="mr-1" />Not recommended (50-59%)
              </span>
              <span className="badge bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <FaQuestion className="mr-1" />Not enough info
              </span>
            </div>
          </div>

          {/* Example Cards */}
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

          {/* More school cards... */}
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

          {/* Pagination */}
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

      {/* Footer */}
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
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition">
              <FaTwitter />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition">
              <FaLinkedinIn />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-1 transition">
              <FaInstagram />
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-center md:text-left">
            <div className="text-sm">
              &copy; 2025 Anonymity. All rights reserved.
            </div>
            <div className="text-sm md:text-right">
              Made with @Nucleosys Tech Pvt. Ltd.
            </div>
          </div>
        </div>
      </footer>

      {/* Add animations */}
      <style>{`
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 0.6s ease forwards;
        }
        .animate-delay-200 {
          animation-delay: 0.2s;
        }
        .animate-delay-300 {
          animation-delay: 0.4s;
        }
        .animate-delay-400 {
          animation-delay: 0.6s;
        }
        .animate-delay-500 {
          animation-delay: 0.8s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .btn-primary {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background-color: #3a0ca3;
          transition: width 0.3s ease;
          z-index: -1;
        }
        .btn-primary:hover::before {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Home;