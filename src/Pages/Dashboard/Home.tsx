// ../../Pages/Home/Home.tsx (or your actual path)

import React, { useState, useEffect } from "react";
import GoogleLoginButton from "../../Pages/Auth/GoogleLoginButton";
import {
  FaSearch,
  FaPencilAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaUserCircle,
  FaUserPlus,
  FaSignInAlt,
  FaApple,
  FaGooglePlay
} from "react-icons/fa";
import { GoogleOAuthProvider } from "@react-oauth/google";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { login, logout } from "../Auth/AuthService";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../API/apiConfig";
import BrowseSchools from "../Schoolsforuser/BrowseSchools";

interface UserData {
  email: string;
  userName?: string;
  profilePicture?: string;
  authProvider?: string;
  roleId?: number;
}

const Home = () => {
  const [, setActiveSection] = useState("home");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);

  const [showBrowseSchoolsView, setShowBrowseSchoolsView] = useState(false);

  // State to track if the profile image failed to load
  const [profileImageLoadError, setProfileImageLoadError] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUserData = JSON.parse(user) as UserData;
        if (parsedUserData.roleId === 1) {
          navigate("/admin/dashboardadmin", { replace: true });
        }
        setIsLoggedIn(true);
        setUserData(parsedUserData);
        // When user data is loaded, reset any previous image load error
        setProfileImageLoadError(false); 
      } catch (e) {
        console.error("Failed to parse user data", e);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setShowBrowseSchoolsView(false);
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

  // Effect to reset profile image error when the profile picture URL changes
  useEffect(() => {
    if (userData?.profilePicture) {
      setProfileImageLoadError(false); // Reset error when a new picture URL is set
    }
  }, [userData?.profilePicture]);


  useEffect(() => {
    if (userData?.roleId === 1) return;
    if (location.state?.scrollToAuthSection && !isLoggedIn) {
      const authElement = document.getElementById("auth-login-forms");
      if (authElement) {
        const highlightTarget = authElement.closest('#auth-login-forms-container') || authElement;
        highlightTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          highlightTarget.classList.add("highlight-animation");
          setTimeout(() => {
            highlightTarget.classList.remove("highlight-animation");
          }, 1500);
          const { scrollToAuthSection, ...restState } = location.state || {};
          if (location.state?.scrollToAuthSection) {
            navigate(location.pathname, { replace: true, state: restState });
          }
        }, 500);
      } else {
        if (location.state?.scrollToAuthSection) {
          const { scrollToAuthSection, ...restState } = location.state;
          navigate(location.pathname, { replace: true, state: restState });
        }
      }
    }
  }, [location.state, isLoggedIn, navigate, location.pathname, userData]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn(`Section with id "${id}" not found for scrolling.`);
    }
  };

  useEffect(() => {
    if (showBrowseSchoolsView) {
      const timer = setTimeout(() => {
        scrollToSection("browseSchools");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showBrowseSchoolsView]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserData(null);
    setShowBrowseSchoolsView(false);
    setProfileImageLoadError(false); // Reset image error on logout
    navigate("/");
    window.dispatchEvent(new Event('storage'));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegisterError("");
    setRegisterSuccess("");
    try {
      const loggedInData = await login(email, password);
      const userProfile: UserData = {
        email: loggedInData.email,
        userName: loggedInData.userName || loggedInData.email.split('@')[0],
        profilePicture: loggedInData.profilePicture || undefined,
        authProvider: 'email',
        roleId: loggedInData.roleId
      };
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      setIsLoggedIn(true);
      setUserData(userProfile);
      setProfileImageLoadError(false); // Reset image error on successful login
      if (userProfile.roleId === 1) {
        navigate("/admin/dashboardadmin");
      } else {
        navigate("/");
      }
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

      const userProfile: UserData = {
        email: apiUserData.email,
        userName: apiUserData.userName || decodedGoogleToken.name || apiUserData.email.split('@')[0],
        profilePicture: apiUserData.profilePicture || decodedGoogleToken.picture || undefined,
        authProvider: 'Google',
        roleId: apiUserData.roleId
      };
      sessionStorage.setItem("token", backendToken);
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      axios.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      setIsLoggedIn(true);
      setUserData(userProfile);
      setProfileImageLoadError(false); // Reset image error on successful login
      if (userProfile.roleId === 1) {
        navigate("/admin/dashboardadmin");
      } else {
        navigate('/');
      }
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Google login failed:', error);
      setError(error.message || "Login failed. Please try again.");
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

  const handleShowBrowseSchools = () => {
    setShowBrowseSchoolsView(true);
  };

  const primaryButtonClasses = "btn-primary w-full rounded-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30";
  const heroActionButtonClasses = "btn-primary bg-[#4361ee] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#3a0ca3] transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-2";
  const cardActionButtonClasses = "btn-primary bg-[#4361ee] text-white font-medium py-3 px-8 rounded-full hover:bg-[#3a0ca3] transition-all text-base mt-auto flex items-center justify-center transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-1";

  if (userData?.roleId === 1 && isLoggedIn) {
    // return <div>Redirecting to admin dashboard...</div>;
  }

  return (
    <div className="font-poppins bg-[#f5f7ff] min-h-screen flex flex-col">
      <section className="bg-white flex items-start justify-center px-4 pt-0 md:pt-0 pb-4 h-screen">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 animate-fadeIn">
          <div className="flex-1 hidden md:block animate-fadeInLeft">
            <img
              src="/src/img/steptodown.com243970.jpg"
              alt="Left Illustration"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          <div className={`flex-1 w-full text-center animate-fadeInUp ${isLoggedIn ? 'max-w-xl' : 'max-w-md'}`}>
            <h1
              className="leading-snug mb-2 break-words"
              style={{ fontSize: '1.4rem', color: '#3a0ca3', fontWeight: 'bold' }}
            >
              A Clearer View of Schools — <br />Powered by Anonymous Reports
            </h1>
            <p className="text-gray-600 text-sm md:text-base mb-6 whitespace-nowrap">
              By continuing, you agree to our
              <a href="#" className="text-[#4361ee] font-medium hover:underline mx-1">Terms of Use</a> and
              <a href="#" className="text-[#4361ee] font-medium hover:underline ml-1">Privacy Policy</a>.
            </p>

            {!isLoggedIn ? (
              <div id="auth-login-forms-container" className="mt-6 bg-white shadow-xl rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
                {isRegistering ? (
                  <>
                    <h2 className="text-xl font-semibold text-[#3a0ca3] mb-6 text-center">Create Your Account</h2>
                    <form className="space-y-4" onSubmit={handleRegister}>
                      {registerError && <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">{registerError}</div>}
                      {registerSuccess && <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">{registerSuccess}</div>}
                      <div><input id="registerName" type="text" placeholder="Enter your name" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required /></div>
                      <div><input id="registerEmail" type="email" placeholder="Enter your email" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required /></div>
                      <div><input id="registerPassword" type="password" placeholder="Enter your password" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required /></div>
                      <button type="submit" className={primaryButtonClasses}>Register</button>
                    </form>
                    <div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2">
                      <span className="text-md">Already have an account?</span>
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); setError(""); setRegisterError(""); setRegisterSuccess(""); }} className="flex items-center gap-1 text-[#4361ee] font-semibold">
                        <FaSignInAlt className="mr-1" /><span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">Login here</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <div id="auth-login-forms" className="w-full">
                    {registerSuccess && <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">{registerSuccess}</div>}
                    <div className="flex flex-col gap-3 mb-6">
                      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}><GoogleLoginButton onSuccess={handleGoogleLoginSuccess} onError={() => { setError("Google login failed. Please try again."); setRegisterError(""); setRegisterSuccess(""); }} /></GoogleOAuthProvider>
                    </div>
                    <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">or</span></div></div>
                    <form className="space-y-4" onSubmit={handleEmailLogin}>
                      {error && <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">{error}</div>}
                      <div><input id="loginEmail" type="email" placeholder="Enter your email" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                      <div><input id="loginPassword" type="password" placeholder="Enter your password" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                      <button type="submit" className={primaryButtonClasses}>Continue with Email</button>
                    </form>
                    <div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2">
                      <span className="text-md">Don't have an account?</span>
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); setError(""); setRegisterError(""); setRegisterSuccess(""); }} className="flex items-center gap-1 text-[#4361ee] font-semibold">
                        <FaUserPlus className="mr-1" /><span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">Register here</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center animate-fadeIn w-full">
                <div className="flex justify-center mb-6"> {/* Increased mb from 4 to 6 */}
                  {userData?.profilePicture && !profileImageLoadError ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#4361ee] object-cover" // Increased size and added object-cover
                      onError={() => setProfileImageLoadError(true)} 
                    />
                  ) : (
                    <FaUserCircle className="text-8xl sm:text-9xl text-gray-400 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center" /> // Increased size and icon font size
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#3a0ca3] mb-3">Welcome {userData?.userName || userData?.email.split('@')[0]}!</h2> {/* Increased font size and mb */}
                <p className="text-gray-600 mb-8 text-sm sm:text-base">You're now logged in. Explore reports or share your own experience below.</p> {/* Increased mb */}
                <button onClick={() => scrollToSection("mainWelcomeBlock")} className="btn-primary bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm sm:text-base">Browse Schools</button>
              </div>
            )}
          </div>

          <div className="flex-1 hidden md:block animate-fadeInRight">
            <img src="/src/img/steptodown.com659970.jpg" alt="Right Illustration" className="w-full h-auto rounded-2xl object-cover" />
          </div>
        </div>
      </section>

      {isLoggedIn && userData?.roleId !== 1 && (
        <div className="main-content flex-grow py-12 md:py-16">
          <div id="mainWelcomeBlock" className="container text-center mb-16 md:mb-20">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-[#3a0ca3] animate-fadeIn">Welcome to Guest Teacher Report</h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4 animate-fadeIn animate-delay-200">An honest review platform for guest teachers, aides, and support staff visiting schools across USA and Canada.</p>
            <button onClick={() => navigate('/write-review')}
              className={`${heroActionButtonClasses} mt-10 flex items-center justify-center mx-auto animate-fadeIn animate-delay-300 text-lg px-10 py-4`}>
              <FaPencilAlt className="mr-2" />Write a Review
            </button>
          </div>

          <div className="container mb-12 md:mb-16">
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-transparent hover:border-[#4361ee]/30 flex-1 flex flex-col items-center transform hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer animate-fadeInUp"
                onClick={() => navigate('/submit-report')}
                style={{ animationDelay: '0.4s' }}>
                <FaPencilAlt className="text-5xl text-[#4361ee] mb-5" />
                <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3 text-center">Share Your Experience</h3>
                <p className="text-gray-600 text-base mb-6 text-center flex-grow">Help others by submitting a report about schools you've worked at.</p>
                <button onClick={(e) => { e.stopPropagation(); navigate('/submit-report') }} className={`${cardActionButtonClasses} flex items-center justify-center`}>
                  <FaPencilAlt className="mr-2 text-sm" />Write a Review
                </button>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-transparent hover:border-[#4361ee]/30 flex-1 flex flex-col items-center transform hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer animate-fadeInUp"
                onClick={handleShowBrowseSchools}
                style={{ animationDelay: '0.6s' }}>
                <FaSearch className="text-5xl text-[#4361ee] mb-5" />
                <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3 text-center">Find Schools & Reports</h3>
                <p className="text-gray-600 text-base mb-6 text-center flex-grow">Search our database for schools and read reports from other guest teachers.</p>
                <button onClick={(e) => { e.stopPropagation(); handleShowBrowseSchools() }} className={`${cardActionButtonClasses} flex items-center justify-center`}>
                  <FaSearch className="mr-2 text-sm" />Browse Schools
                </button>
              </div>
            </div>
          </div>

          {showBrowseSchoolsView && <BrowseSchools />}
        </div>
      )}

      {/* <footer className="bg-[oklch(0.52_0.01_0)] text-gray-300 py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <a href="/" className="inline-block text-3xl font-bold text-white hover:text-gray-200 transition mb-4">
                GuestReport
              </a>
              <p className="text-sm text-gray-400">
                Anonymously share and discover school experiences.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white hover:underline">About Us</a></li>
                <li><a href="#" className="hover:text-white hover:underline">How It Works</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Careers</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Press</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Resources</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:text-white hover:underline">FAQ</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Guidelines</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-700 my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Download the App:</span>
              <a href="#" aria-label="Download on the App Store" className="text-xl hover:text-white transition"><FaApple /></a>
              <a href="#" aria-label="Get it on Google Play" className="text-xl hover:text-white transition"><FaGooglePlay /></a>
            </div>
            <div className="social-icons flex gap-4">
              <a href="#" aria-label="Facebook" className="text-xl w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter" className="text-xl w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaTwitter /></a>
              <a href="#" aria-label="LinkedIn" className="text-xl w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaLinkedinIn /></a>
              <a href="#" aria-label="Instagram" className="text-xl w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaInstagram /></a>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              © {new Date().getFullYear()} GuestReport. All rights reserved. <br className="sm:hidden" />
              <span className="hidden sm:inline">| </span>
              Made by Nucleosys Tech
            </div>
          </div>
        </div>
      </footer> */}

      <style>{`
        .animate-fadeIn { opacity: 0; animation: fadeIn 0.6s ease forwards; }
        .animate-fadeInLeft { opacity: 0; animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fadeInRight { opacity: 0; animation: fadeInRight 0.8s ease-out forwards; }
        .animate-fadeInUp { opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
        .animate-delay-200 { animation-delay: 0.2s; } 
        .animate-delay-300 { animation-delay: 0.4s; } 
        .animate-delay-400 { animation-delay: 0.6s; } 
        .animate-delay-500 { animation-delay: 0.8s; } 
        .animate-delay-600 { animation-delay: 1.0s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
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
          background-color: var(--btn-sheen-color, rgba(255, 255, 255, 0.15)); 
          transition: width 0.3s ease;
          z-index: -1;
          border-radius: inherit;
        }
        .btn-primary.bg-\\[\\#4361ee\\]::before { 
            --btn-sheen-color: rgba(255, 255, 255, 0.15);
        }
        .btn-primary:hover::before {
          width: 100%;
        }
        
        @keyframes highlight-auth-section { 
          0% { box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); } 
          50% { box-shadow: 0 0 20px 8px rgba(58, 12, 163, 0.35); } 
          100% { box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); } 
        }
        #auth-login-forms-container.highlight-animation { 
            animation: highlight-auth-section 1.5s ease-in-out; 
            border-radius: 1rem; /* Should match rounded-2xl */
        }
        
        .container { 
          width: 90%; 
          max-width: 1200px; 
          margin-left: auto; 
          margin-right: auto; 
          padding-left: 1rem; 
          padding-right: 1rem; 
        }
      `}</style>
    </div>
  );
};

export default Home;