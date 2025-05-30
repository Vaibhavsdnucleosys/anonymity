import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { API_ENDPOINTS } from "../../API/apiConfig";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginButtonProps {
    onSuccess?: (userData: any) => void;
    onError?: (errorMessage: string) => void;
}

interface DecodedToken {
    email?: string;
    name?: string;
    picture?: string;
    exp?: number;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
    const navigate = useNavigate();

const handleSuccess = async (credentialResponse: any) => {
  try {
    const googleToken = credentialResponse?.credential;

    if (!googleToken || typeof googleToken !== 'string') {
      throw new Error("Invalid Google credential received.");
    }

    // Optional: decode token just to log or inspect user info
    const decodedToken = jwtDecode<DecodedToken>(googleToken);
    console.log("Decoded Google Token:", decodedToken);

    // Remove stale auth headers before login
    delete axios.defaults.headers.common['Authorization'];

    // Send token to your backend for verification and user creation/login
    const response = await axios.post(API_ENDPOINTS.GoogleLogin, {
      token: googleToken,
    });

    console.log("Google login API response:", response.data);

    const { token, user } = response.data;

    if (!token || !user) {
      throw new Error("Missing token or user in response");
    }

    // Store session
    sessionStorage.setItem('auth', JSON.stringify({
      token,
      user: {
        email: user.email,
        name: user.userName,
        authProvider: user.authProvider,
      }
    }));

    // Set Authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Optional success callback
    if (onSuccess) {
      onSuccess(user);
    }

    // Navigate after successful login
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  } catch (error: any) {
    console.error('Google login failed (full):', error);

    // Get appropriate error message
    let message = "Login failed. Please try again.";
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Show alert and clean session
    alert(message);
    sessionStorage.removeItem('auth');

    if (onError) {
      onError(message);
    }
  }
};


    const handleError = () => {
        const errorMessage = 'Google login failed. Please try again or use another method.';
        console.log(errorMessage);
        if (onError) {
            onError(errorMessage);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            text="continue_with"
            shape="pill"
            size="large"
            auto_select // Enable auto-selection for returning users
        />
    );
};

export default GoogleLoginButton;