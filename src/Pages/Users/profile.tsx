// src/components/Profile/Profile.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCalendarAlt, FaFileAlt, FaKey, FaUserEdit } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { toast } from 'sonner';
import { API_ENDPOINTS } from "../../API/apiConfig";

function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT payload:", e);
    return null;
  }
}

interface JwtPayload {
  sub: string;
  jti: string;
  id: string;
  auth_provider: string;
}

interface UserProfileData {
  id: number;
  email: string;
  userName: string;
  name: string;
  bio?: string;
  createdAt?: string;
  reportsSubmittedCount?: number;
  password?: string;
}

interface UpdateUserPayload {
  id: number;
  userName: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userIdToFetch, setUserIdToFetch] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState<boolean>(false);

  const [formUserName, setFormUserName] = useState('');
  const [formBio, setFormBio] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as { userId?: string };
    const idFromState = state?.userId;
    if (idFromState) {
      setUserIdToFetch(idFromState);
    } else {
      const token = sessionStorage.getItem("token");
      if (token) {
        const decodedPayload = decodeJwtPayload(token) as JwtPayload | null;
        if (decodedPayload && decodedPayload.id) {
          setUserIdToFetch(decodedPayload.id);
        } else {
          toast.error("User ID not found in token. Please log in again.");
          setLoading(false);
          navigate("/");
        }
      } else {
        toast.error("No session found. Please log in.");
        setLoading(false);
        navigate("/");
      }
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!userIdToFetch) return;
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get<UserProfileData>(`${API_ENDPOINTS.User}/${userIdToFetch}`);
        setUserData(response.data);
        setFormUserName(response.data.userName || '');
        setFormBio(response.data.bio || '');
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userIdToFetch]);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const resetProfileFormFields = () => {
    if (userData) {
      setFormUserName(userData.userName || '');
      setFormBio(userData.bio || '');
    }
  };

  const handleEditProfileToggle = () => {
    if (isEditingProfile) {
      resetProfileFormFields();
    }
    setIsEditingProfile(prev => !prev);
  };

  const handleRequestPasswordReset = async () => {
    if (!userData || !userData.email) {
      toast.error("User email not found. Cannot request password reset.");
      return;
    }
    setIsRequestingPasswordReset(true);
    try {
      await axios.post(API_ENDPOINTS.RequestPasswordReset, { email: userData.email });
      toast.success(`A password reset link has been sent to ${userData.email}. Please check your inbox.`);
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      const errorMessage = error.response?.data?.message || "Failed to request password reset link.";
      toast.error(errorMessage);
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const formUserNameTrimmed = formUserName.trim();

    if (formUserNameTrimmed === "") {
        toast.error("Username cannot be empty.");
        return;
    }

    const effectiveUserName = formUserNameTrimmed;

    const profileUpdatePayload: UpdateUserPayload = {
      id: userData.id,
      userName: effectiveUserName,
    };
    let hasActualChanges = false;

    if (effectiveUserName !== userData.userName) {
      hasActualChanges = true;
    }

    const originalBio = userData.bio || '';
    const formBioTrimmed = formBio.trim();

    if (formBioTrimmed !== originalBio) {
      profileUpdatePayload.bio = formBioTrimmed;
      hasActualChanges = true;
    }
    else if (!profileUpdatePayload.hasOwnProperty('bio')) {
      profileUpdatePayload.bio = originalBio;
    }


    if (!hasActualChanges) {
      toast.info("No profile changes were made.");
      setIsEditingProfile(false);
      return;
    }

    try {
      await axios.put(`${API_ENDPOINTS.User}/${userData.id}`, profileUpdatePayload);
      toast.success("Profile updated successfully!");

      if (userIdToFetch) {
        const response = await axios.get<UserProfileData>(`${API_ENDPOINTS.User}/${userIdToFetch}`);
        setUserData(response.data);
        setFormUserName(response.data.userName || '');
        setFormBio(response.data.bio || '');

        // Update sessionStorage to reflect the username change in the Navbar
        const storedUser = sessionStorage.getItem("user");
        if(storedUser) {
            const userObject = JSON.parse(storedUser);
            userObject.userName = response.data.userName;
            sessionStorage.setItem("user", JSON.stringify(userObject));
            window.dispatchEvent(new Event('storage')); // Notify Navbar of change
        }
      }
      setIsEditingProfile(false);
    } catch (error: any)      {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    }
  };

  if (loading && !userData) {
    return <div className="flex justify-center items-center h-screen bg-gray-100"><HashLoader color="#3B82F6" size={50} /></div>;
  }
  if (!userData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4 text-center">
        <p className="text-xl text-red-600">Could not load user profile.</p>
        <p className="text-gray-700">Please ensure you are logged in and try again.</p>
      </div>
    );
  }

  const memberSinceDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:items-start">
        <div className="w-full lg:w-1/3 h-auto bg-white p-6 rounded-xl shadow-lg lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
              {getInitials(userData.userName)}
            </div>
            <p className="text-2xl font-semibold text-gray-800">{userData.userName}</p>
            <p className="text-sm text-gray-500 mb-4">@{userData.userName}</p>
            <div className="w-full">
              <button
                onClick={handleEditProfileToggle}
                disabled={isRequestingPasswordReset}
                className={`mb-3 w-full flex items-center justify-center gap-2 px-6 py-2 rounded-md transition duration-200 text-sm font-medium shadow hover:shadow-md ${isRequestingPasswordReset ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                <FaUserEdit /> {isEditingProfile ? 'Cancel Profile Edit' : 'Edit Profile Info'}
              </button>

              <button
                onClick={handleRequestPasswordReset}
                disabled={isEditingProfile || isRequestingPasswordReset}
                className={`w-full flex items-center justify-center gap-2 px-6 py-2 rounded-md transition duration-200 text-sm font-medium shadow hover:shadow-md ${(isEditingProfile || isRequestingPasswordReset) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                <FaKey /> {isRequestingPasswordReset ? 'Sending Link...' : 'Request Password Reset'}
              </button>
            </div>

          </div>
          <hr className="my-6 border-gray-200" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center"><FaEnvelope className="inline mr-3 text-blue-500 text-base" />Email: {userData.email}</p>
              <p className="flex items-center"><FaCalendarAlt className="inline mr-3 text-blue-500 text-base" />Member Since: {memberSinceDate}</p>
              <p className="flex items-center"><FaFileAlt className="inline mr-3 text-blue-500 text-base" />Reports Submitted: {userData.reportsSubmittedCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditingProfile ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                  value={formUserName}
                  onChange={(e) => setFormUserName(e.target.value)}
                  readOnly={!isEditingProfile}
                  placeholder={userData.userName}
                />
                <p className="mt-1 text-xs text-gray-500">This will be displayed instead of your email for privacy.</p>
              </div>
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="emailAddress" className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" value={userData.email} readOnly />
              </div>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                id="bio"
                rows={5}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditingProfile ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder={userData.bio || "Tell us a bit about yourself..."}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                readOnly={!isEditingProfile}
              ></textarea>
            </div>
            {isEditingProfile && (
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleEditProfileToggle} className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600">Save Profile Changes</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;