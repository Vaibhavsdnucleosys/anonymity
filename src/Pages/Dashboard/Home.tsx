import React, { useState, useEffect } from "react";
import GoogleLoginButton from "../../Pages/Auth/GoogleLoginButton";
import {
  FaSearch,
  FaPencilAlt,
  FaUserCircle,
  FaUserPlus,
  FaSignInAlt,
  // Icons for RecentReviewsList
  FaSchool,
  FaMapMarkerAlt,
  FaStar,
  FaStarHalfAlt,
  FaQuestionCircle as FaQuestion,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaInfoCircle,
  FaEdit,
} from "react-icons/fa";
import { GoogleOAuthProvider } from "@react-oauth/google";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { login } from "../Auth/AuthService";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../API/apiConfig";
import { toast } from "sonner";
import PreLoginContent from "./PreLoginContent"; // Adjust the path if necessary
import BrowseSchools from "../Schoolsforuser/BrowseSchools";


// --- START: CORRECTED RecentReviewsList Component ---
// This version is updated to handle the new NESTED data structure from your API.

// This interface matches the "reviewDetails" object in your JSON
interface ReviewDetails {
  id: number;
  schoolId: number;
  gradeLevel: string;
  overallRating: number;
  // Add any other properties from reviewDetails you might need
}

// This is the main interface for each item in the API response array
interface ApiResponseReview {
  schoolName: string;
  reviewDetails: ReviewDetails; // The nested object
  // Add other top-level properties if needed
}

const RecentReviewsList: React.FC<{ isLoggedIn: boolean; scrollToLogin: () => void; }> = ({ isLoggedIn, scrollToLogin }) => {
  // State now holds the new ApiResponseReview type
  const [reviews, setReviews] = useState<ApiResponseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const navigate = useNavigate();
  const linkStyle = "text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center";

  // This function remains the same and correctly uses the rating you pass to it.
  const getRatingDetails = (rating: number) => {
    if (!rating || rating < 1 || rating > 5) {
      return { grade: "N/A", stars: 0, badgeText: "No Rating", badgeColor: 'gray' };
    }
    const percentage = rating * 20;
    if (percentage >= 90) return { grade: `${Math.round(percentage)}% A`, stars: 5, badgeText: "Great school!", badgeColor: 'green' };
    if (percentage >= 80) return { grade: `${Math.round(percentage)}% B`, stars: 4, badgeText: "Good school!", badgeColor: 'blue' };
    if (percentage >= 70) return { grade: `${Math.round(percentage)}% C`, stars: 3, badgeText: "Average school", badgeColor: 'yellow' };
    if (percentage >= 60) return { grade: `${Math.round(percentage)}% D`, stars: 2, badgeText: "Below average", badgeColor: 'orange' };
    return { grade: `${Math.round(percentage)}% F`, stars: 1, badgeText: "Not recommended", badgeColor: 'red' };
  };

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponseReview[]>(API_ENDPOINTS.GetAllReviews);
        const allReviews = response.data;

        // SAFETY CHECK: Filter out any reviews that might be missing the nested 'reviewDetails' object.
        const validReviews = allReviews.filter(review => review.reviewDetails);

        setTotalReviews(validReviews.length);
        setReviews(validReviews.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recent reviews:", err);
        setError("Could not load recent reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentReviews();
  }, []);

  const handleActionClick = (e: React.MouseEvent, action: 'details' | 'submit', schoolId: number) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please log in to perform this action.", { description: "You'll be scrolled to the login section." });
      scrollToLogin();
    } else {
      if (action === 'details') navigate(`/schools/${schoolId}`);
      else if (action === 'submit') navigate(`/submit-report?schoolId=${schoolId}`);
    }
  };

  return (
    <section id="recent-reviews" className="container my-12 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h5 className="font-semibold text-lg text-[#3a0ca3]">Recent Reviews</h5>
        {!loading && reviews.length > 0 && <div className="text-gray-500">Showing {reviews.length} of {totalReviews} total</div>}
      </div>

      <div className="mb-6 p-3 bg-gray-100 border rounded-lg"><strong className="block mb-2 text-gray-800">School Rating Categories</strong><div className="flex flex-wrap gap-2">
        <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
          <FaStar className="mr-1" />Great (90-100%)</span><span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
            <FaStar className="mr-1" />Good (80-89%)</span><span className="badge bg-yellow-500 text-gray-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
              <FaStar className="mr-1" />Average (70-79%)</span><span className="badge bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <FaStar className="mr-1" />Below avg (60-69%)</span><span className="badge bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <FaStar className="mr-1" />Not recommended (50-59%)</span><span className="badge bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                    <FaQuestion className="mr-1" />Not enough info</span></div></div>

      {loading && <div className="text-center p-8 text-gray-600">Loading recent reviews...</div>}
      {error && <div className="text-center p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

      {!loading && !error && reviews.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No recent reviews found. Be the first to <a href="/submit-report" className={linkStyle}>submit one</a>!</p>
        </div>
      )}

      {/* UPDATED: The .map function now accesses data from the nested `reviewDetails` object */}
      {!loading && !error && reviews.map(review => {
        // Get rating details from the nested object
        const ratingDetails = getRatingDetails(review.reviewDetails.overallRating);

        return (
          // Use the unique review ID from the nested object for the key
          <div key={review.reviewDetails.id} className={`school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-${ratingDetails.badgeColor}-500 bg-${ratingDetails.badgeColor}-50/10`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h5 className={`text-lg font-semibold mb-1 flex items-center`}>
                  {/* Get school name from the top-level object */}
                  <FaSchool className={`text-${ratingDetails.badgeColor}-600 mr-2`} />{review.schoolName}
                </h5>
                <small className="text-gray-500 flex items-center">
                  {/* DYNAMIC GRADE LEVEL: Get grade level from the nested object */}
                  <FaMapMarkerAlt className="mr-1" />Grade Level: {review.reviewDetails.gradeLevel}
                </small>
              </div>
              <div className="text-right">
                <span className={`badge bg-${ratingDetails.badgeColor}-500 ${ratingDetails.badgeColor === 'yellow' ? 'text-gray-800' : 'text-white'} px-3 py-1 rounded-full text-sm`}>
                  {ratingDetails.badgeText}
                </span>
                <div className="mt-2">
                  <strong>Grade: {ratingDetails.grade}</strong>
                  <div className="inline-flex items-center ml-2">
                    {[...Array(Math.floor(ratingDetails.stars))].map((_, i) => (<FaStar key={`${review.reviewDetails.id}-star-${i}`} className="text-yellow-400 text-sm" />))}
                    {ratingDetails.stars % 1 !== 0 && <FaStarHalfAlt className="text-yellow-400 text-sm" />}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              {/* Pass the schoolId from the nested object to the click handlers */}
              <a href="#" onClick={(e) => handleActionClick(e, 'details', review.reviewDetails.schoolId)} className={`${linkStyle}`}>
                <FaInfoCircle className="mr-1" />View School Details
              </a>
              <a href="#" onClick={(e) => handleActionClick(e, 'submit', review.reviewDetails.schoolId)} className={`${linkStyle}`}>
                <FaEdit className="mr-1" />{isLoggedIn ? 'Submit Your Report' : 'Login to Submit Report'}
              </a>
            </div>
          </div>
        );
      })}

      <nav className="mt-8"><ul className="pagination flex justify-center gap-1"><li className="page-item disabled"><button className="page-link p-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50"><FaAngleDoubleLeft size={14} /></button></li><li className="page-item active"><button className="page-link px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">1</button></li><li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">2</button></li><li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">3</button></li><li className="page-item disabled"><button className="page-link px-4 py-2 rounded-lg text-gray-400 font-medium">...</button></li><li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">10</button></li><li className="page-item"><button className="page-link p-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50"><FaAngleDoubleRight size={14} /></button></li></ul></nav>
    </section>
  );
};
// --- END: CORRECTED RecentReviewsList Component ---


interface UserData { email: string; userName?: string; profilePicture?: string; authProvider?: string; roleId?: number; }

const Home = () => {
  const [,] = useState("home");
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [profileImageLoadError, setProfileImageLoadError] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    if (token && user) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const parsedUserData = JSON.parse(user) as UserData;
        if (parsedUserData.roleId === 1) { navigate("/admin/dashboardadmin", { replace: true }); return; }
        setIsLoggedIn(true);
        setUserData(parsedUserData);
        setProfileImageLoadError(false);
      } catch (e) { console.error("Failed to parse user data from storage", e); handleLogout(); }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const scrollToLogin = () => {
    const authElement = document.getElementById("auth-login-forms-container");
    if (authElement) {
      authElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      authElement.classList.add("highlight-animation");
      setTimeout(() => { authElement.classList.remove("highlight-animation"); }, 1500);
    }
  };

  const handleShowBrowseSchools = () => {
    // This function now scrolls to the imported BrowseSchools component
    const section = document.getElementById('browseSchools');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false); setUserData(null); setProfileImageLoadError(false); navigate("/"); window.dispatchEvent(new Event('storage'));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setRegisterError(""); setRegisterSuccess("");
    try {
      const loggedInData = await login(email, password);
      const userProfile: UserData = { email: loggedInData.email, userName: loggedInData.userName || loggedInData.email.split('@')[0], profilePicture: loggedInData.profilePicture, authProvider: 'email', roleId: loggedInData.roleId };
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      setIsLoggedIn(true); setUserData(userProfile); setProfileImageLoadError(false);
      if (userProfile.roleId === 1) { navigate("/admin/dashboardadmin"); } else { navigate("/"); }
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) { console.error("Login error:", error); setError(error.message || "Login failed. Please try again."); }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setError(""); setRegisterError(""); setRegisterSuccess("");
      const googleToken = credentialResponse.credential; if (!googleToken) throw new Error("Invalid Google credential received");
      const decodedGoogleToken = jwtDecode(googleToken) as any;
      const response = await axios.post(API_ENDPOINTS.GoogleLogin, { token: googleToken }); if (!response.data?.token) throw new Error("No token received from backend");
      const backendToken = response.data.token; const apiUserData = response.data.user;
      const userProfile: UserData = { email: apiUserData.email, userName: apiUserData.userName || decodedGoogleToken.name, profilePicture: apiUserData.profilePicture || decodedGoogleToken.picture, authProvider: 'Google', roleId: apiUserData.roleId };
      sessionStorage.setItem("token", backendToken);
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      axios.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      setIsLoggedIn(true); setUserData(userProfile); setProfileImageLoadError(false);
      if (userProfile.roleId === 1) { navigate("/admin/dashboardadmin"); } else { navigate('/'); }
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) { console.error('Google login failed:', error); setError(error.message || "Login failed. Please try again."); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setRegisterError(""); setRegisterSuccess(""); setError("");
    if (!registerName || !registerEmail || !registerPassword) { setRegisterError("All fields are required."); return; }
    if (registerPassword.length < 6) { setRegisterError("Password must be at least 6 characters long."); return; }
    try {
      await axios.post(API_ENDPOINTS.Register, { userName: registerName, email: registerEmail, password: registerPassword, authProvider: "email" });
      setRegisterSuccess("Registration successful! Please login.");
      setRegisterName(""); setRegisterEmail(""); setRegisterPassword(""); setIsRegistering(false);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.data) {
        if (err.response.data.errors?.AuthProvider) { setRegisterError(err.response.data.errors.AuthProvider[0]); }
        else if (err.response.data.message) { setRegisterError(err.response.data.message); }
        else { setRegisterError("Registration failed. Please try again."); }
      } else { setRegisterError(err.message || "Registration failed. Please try again."); }
    }
  };

  const primaryButtonClasses = "btn-primary w-full rounded-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30";
  const heroActionButtonClasses = "btn-primary bg-[#4361ee] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#3a0ca3] transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-2";
  const cardActionButtonClasses = "btn-primary bg-[#4361ee] text-white font-medium py-3 px-8 rounded-full hover:bg-[#3a0ca3] transition-all text-base mt-auto flex items-center justify-center transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-1";

  return (
    <div className="font-poppins bg-[#f5f7ff] min-h-screen flex flex-col">

      <section className="bg-white flex items-start justify-center px-4 pt-0 md:pt-0 pb-4 h-screen relative overflow-hidden">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-12 animate-fadeIn z-10">
          <div className="flex-1 hidden md:block animate-fadeInLeft"><img src="/src/img/steptodown.com243970.jpg" alt="Left Illustration" className="w-full h-auto rounded-2xl object-cover" /></div>
          <div className={`flex-1 w-full text-center animate-fadeInUp ${isLoggedIn ? 'max-w-xl' : 'max-w-md'}`}>
            <h1 className="leading-snug mb-2 break-words" style={{ fontSize: '1.4rem', color: '#3a0ca3', fontWeight: 'bold' }}>A Clearer View of Schools — <br />Powered by Anonymous Reports</h1>
            <p className="text-gray-600 text-sm md:text-base mb-6 whitespace-nowrap">By continuing, you agree to our <a href="#" className="text-[#4361ee] font-medium hover:underline mx-1">Terms of Use</a> and <a href="#" className="text-[#4361ee] font-medium hover:underline ml-1">Privacy Policy</a>.</p>
            {!isLoggedIn ? (
              <div id="auth-login-forms-container" className="mt-6 bg-white shadow-xl rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
                {isRegistering ? (
                  <><h2 className="text-xl font-semibold text-[#3a0ca3] mb-6 text-center">Create Your Account</h2><form className="space-y-4" onSubmit={handleRegister}>{registerError && <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">{registerError}</div>}{registerSuccess && <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">{registerSuccess}</div>}<div><input id="registerName" type="text" placeholder="Enter your name" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required /></div><div><input id="registerEmail" type="email" placeholder="Enter your email" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required /></div><div><input id="registerPassword" type="password" placeholder="Enter your password" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 focus:border-[#4361ee]" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required /></div><button type="submit" className={primaryButtonClasses}>Register</button></form><div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2"><span className="text-md">Already have an account?</span><a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); setError(""); setRegisterError(""); setRegisterSuccess(""); }} className="flex items-center gap-1 text-[#4361ee] font-semibold"><FaSignInAlt className="mr-1" /><span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">Login here</span></a></div></>
                ) : (
                  <div id="auth-login-forms" className="w-full">{registerSuccess && <div className="text-green-600 text-sm mb-3 text-left p-2 bg-green-50 border border-green-300 rounded-md">{registerSuccess}</div>}<div className="flex flex-col gap-3 mb-6"><GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}><GoogleLoginButton onSuccess={handleGoogleLoginSuccess} onError={() => { setError("Google login failed. Please try again."); }} /></GoogleOAuthProvider></div><div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">or</span></div></div><form className="space-y-4" onSubmit={handleEmailLogin}>{error && <div className="text-red-500 text-sm mb-3 text-left p-2 bg-red-50 border border-red-300 rounded-md">{error}</div>}<div><input id="loginEmail" type="email" placeholder="Enter your email" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div><input id="loginPassword" type="password" placeholder="Enter your password" className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button type="submit" className={primaryButtonClasses}>Continue with Email</button></form><div className="mt-6 text-base text-gray-700 flex items-center justify-center gap-2"><span className="text-md">Don't have an account?</span><a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); setError(""); setRegisterError(""); setRegisterSuccess(""); }} className="flex items-center gap-1 text-[#4361ee] font-semibold"><FaUserPlus className="mr-1" /><span className="text-base transition-all duration-300 hover:text-[#3a0ca3] hover:underline">Register here</span></a></div></div>
                )}
              </div>
            ) : (
              <div className="text-center animate-fadeIn w-full">
                <div className="flex justify-center mb-6">{userData?.profilePicture && !profileImageLoadError ? <img src={userData.profilePicture} alt="Profile" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#4361ee] object-cover" onError={() => setProfileImageLoadError(true)} /> : <FaUserCircle className="text-8xl sm:text-9xl text-gray-400 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center" />}</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#3a0ca3] mb-3">Welcome {userData?.userName || userData?.email.split('@')[0]}!</h2>
                <p className="text-gray-600 mb-8 text-sm sm:text-base">You're logged in. Explore reports or share your own experience.</p>
                <button onClick={() => document.getElementById('browseSchools')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm sm:text-base">Browse Schools</button>
              </div>
            )}
          </div>
          <div className="flex-1 hidden md:block animate-fadeInRight"><img src="/src/img/steptodown.com659970.jpg" alt="Right Illustration" className="w-full h-auto rounded-2xl object-cover" /></div>
        </div>

        <ul className="background-shapes">
          <li></li><li></li><li></li><li></li><li></li>
          <li></li><li></li><li></li><li></li><li></li>
        </ul>
      </section>

      {/* Main content area, shown for all non-admin users */}
      {userData?.roleId !== 1 && (
        <div className="main-content flex-grow">

          {/* Content shown ONLY to logged-in users */}
          {isLoggedIn && (
            <div className="py-12 md:py-16">
              <div id="mainWelcomeBlock" className="container text-center mb-16 md:mb-20">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-[#3a0ca3] animate-fadeIn">Welcome to Guest Teacher Report</h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4 animate-fadeIn animate-delay-200">An honest review platform for guest teachers, aides, and support staff.</p>
                <button onClick={() => navigate('/write-review')} className={`${heroActionButtonClasses} mt-10 flex items-center justify-center mx-auto animate-fadeIn animate-delay-300 text-lg px-10 py-4`}><FaPencilAlt className="mr-2" />Write a Review</button>
              </div>
              <div className="container mb-12 md:mb-16">
                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-transparent hover:border-[#4361ee]/30 flex-1 flex flex-col items-center transform hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer animate-fadeInUp" onClick={() => navigate('/submit-report')} style={{ animationDelay: '0.4s' }}>
                    <FaPencilAlt className="text-5xl text-[#4361ee] mb-5" />
                    <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3 text-center">Share Your Experience</h3>
                    <p className="text-gray-600 text-base mb-6 text-center flex-grow">Help others by submitting a report about schools you've worked at.</p>
                    <button onClick={(e) => { e.stopPropagation(); navigate('/submit-report') }} className={`${cardActionButtonClasses} flex items-center justify-center`}><FaPencilAlt className="mr-2 text-sm" />Write a Review</button>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-transparent hover:border-[#4361ee]/30 flex-1 flex flex-col items-center transform hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer animate-fadeInUp" onClick={handleShowBrowseSchools} style={{ animationDelay: '0.6s' }}>
                    <FaSearch className="text-5xl text-[#4361ee] mb-5" />
                    <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3 text-center">Find Schools & Reports</h3>
                    <p className="text-gray-600 text-base mb-6 text-center flex-grow">Search our database and read reports from other guest teachers.</p>
                    <button onClick={(e) => { e.stopPropagation(); handleShowBrowseSchools() }} className={`${cardActionButtonClasses} flex items-center justify-center`}><FaSearch className="mr-2 text-sm" />Browse Schools</button>
                  </div>
                </div>
              </div>
              {/* --- REPLACED: Call the external BrowseSchools component --- */}
              <BrowseSchools />
            </div>
          )}

          {/* Content shown ONLY to logged-out users to encourage signup */}
          {!isLoggedIn && (
            <div className="pt-12 md:pt-16">
              <PreLoginContent scrollToLogin={scrollToLogin} />
            </div>
          )}

          {/* Recent reviews component, visible to ALL non-admin users */}
          <div className="py-12 md:py-16">
            <RecentReviewsList isLoggedIn={isLoggedIn} scrollToLogin={scrollToLogin} />
          </div>

        </div>
      )}

      <style>{`
        /* ... CSS remains the same ... */
        .animate-fadeIn { opacity: 0; animation: fadeIn 0.6s ease forwards; }
        .animate-fadeInLeft { opacity: 0; animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fadeInRight { opacity: 0; animation: fadeInRight 0.8s ease-out forwards; }
        .animate-fadeInUp { opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
        .animate-delay-200 { animation-delay: 0.2s; } 
        .animate-delay-300 { animation-delay: 0.4s; } 
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes highlight-auth-section { 0% { box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); } 50% { box-shadow: 0 0 20px 8px rgba(58, 12, 163, 0.35); } 100% { box-shadow: 0 0 0 0px rgba(58, 12, 163, 0.0); } }
        #auth-login-forms-container.highlight-animation { animation: highlight-auth-section 1.5s ease-in-out; border-radius: 1rem; }
        .container { width: 90%; max-width: 1200px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
        .background-shapes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0; margin: 0; padding: 0; }
        .background-shapes li { position: absolute; display: block; list-style: none; width: 20px; height: 20px; background: rgba(67, 97, 238, 0.15); animation: animate-shapes 25s linear infinite; bottom: -150px; }
        .background-shapes li:nth-child(1){ left: 25%; width: 80px; height: 80px; animation-delay: 0s; }
        .background-shapes li:nth-child(2){ left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
        .background-shapes li:nth-child(3){ left: 70%; width: 20px; height: 20px; animation-delay: 4s; }
        .background-shapes li:nth-child(4){ left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
        .background-shapes li:nth-child(5){ left: 65%; width: 20px; height: 20px; animation-delay: 0s; }
        .background-shapes li:nth-child(6){ left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
        .background-shapes li:nth-child(7){ left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
        .background-shapes li:nth-child(8){ left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
        .background-shapes li:nth-child(9){ left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
        .background-shapes li:nth-child(10){ left: 85%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s; }
        @keyframes animate-shapes { 0% { transform: translateY(0) rotate(0deg); opacity: 1; border-radius: 0; } 100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; } }
      `}</style>
    </div>
  );
};

export default Home;