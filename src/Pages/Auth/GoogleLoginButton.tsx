// import React from 'react';
// import { GoogleLogin } from '@react-oauth/google';
// import { API_ENDPOINTS } from "../../API/apiConfig";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

// interface GoogleLoginButtonProps {
//     onSuccess?: (userData: any) => void;
//     onError?: (errorMessage: string) => void;
// }

// interface DecodedToken {
//     email?: string;
//     name?: string;
//     picture?: string;
//     exp?: number;
// }

// interface AuthResponse {
//     token: string;
//     user: {
//         id: number;
//         email: string;
//         userName: string;
//         authProvider: string;
//     };
// }

// const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
//     const navigate = useNavigate();

//     // const handleSuccess = async (credentialResponse: any) => {
//     //     try {
//     //         const googleToken = credentialResponse?.credential;

//     //         if (!googleToken || typeof googleToken !== 'string') {
//     //             throw new Error("Invalid Google credential received.");
//     //         }

//     //         // Optional: decode token for debugging
//     //         const decodedToken = jwtDecode<DecodedToken>(googleToken);
//     //         console.log("Decoded Google Token:", decodedToken);

//     //         // Clear any existing auth headers
//     //         delete axios.defaults.headers.common['Authorization'];

//     //         // Send token to backend
//     //         const response = await axios.post<AuthResponse>(API_ENDPOINTS.GoogleLogin, {
//     //             token: googleToken,
//     //         });

//     //         console.log("Full API response:", response);

//     //         if (!response.data?.token || !response.data?.user) {
//     //             throw new Error("Invalid response structure from server");
//     //         }

//     //         const { token, user } = response.data;

//     //         // Prepare auth data for storage
//     //         const authData = {
//     //             token,
//     //             user: {
//     //                 id: user.id,
//     //                 email: user.email,
//     //                 name: user.userName,
//     //                 authProvider: user.authProvider,
//     //             }
//     //         };

//     //         // Store session
//     //         sessionStorage.setItem('auth', JSON.stringify(authData));

//     //         // Set auth header for future requests
//     //         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//     //         // Call success callback if provided
//     //         if (onSuccess) {
//     //             onSuccess(user);
//     //         }

//     //         // Navigate and notify other tabs
//     //         navigate('/');
//     //         window.dispatchEvent(new Event('storage'));

//     //     } catch (error: any) {
//     //         console.error('Google login error:', error);

//     //         // Clean up on error
//     //         sessionStorage.removeItem('auth');
//     //         delete axios.defaults.headers.common['Authorization'];

//     //         // Determine error message
//     //         let message = "Login failed. Please try again.";
//     //         if (error.response?.data?.message) {
//     //             message = error.response.data.message;
//     //         } else if (error.message) {
//     //             message = error.message;
//     //         }

//     //         // Show error to user
//     //         alert(message);
//     //         if (onError) {
//     //             onError(message);
//     //         }
//     //     }
//     // };


// const handleSuccess = async (credentialResponse: any) => {
//   try {
//     const googleToken = credentialResponse?.credential;

//     if (!googleToken || typeof googleToken !== 'string') {
//       throw new Error("Invalid Google credential received.");
//     }

//     // Just pass through the credentialResponse directly
//     if (onSuccess) {
//       onSuccess(credentialResponse); // Pass the entire response
//     }
//   } catch (error: any) {
//     console.error('Google login failed:', error);
//     if (onError) {
//       onError(error.message);
//     }
//   }
// };

//     const handleError = () => {
//         const errorMessage = 'Google login failed. Please try again or use another method.';
//         console.error(errorMessage);
//         if (onError) {
//             onError(errorMessage);
//         }
//     };

//     return (
//         <GoogleLogin
//             onSuccess={handleSuccess}
//             onError={handleError}
//             useOneTap
//             text="continue_with"
//             shape="pill"
//             size="large"
//             auto_select
//         />
//     );
// };

// export default GoogleLoginButton;

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginButtonProps {
    onSuccess?: (credentialResponse: CredentialResponse) => void;
    onError?: (errorMessage: string) => void;
}

interface CredentialResponse {
    credential?: string;
    clientId?: string;
    select_by?: string;
}

interface DecodedToken {
    email?: string;
    name?: string;
    picture?: string;
    exp?: number;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
    const handleSuccess = (credentialResponse: CredentialResponse) => {
        try {
            // Validate credential exists and is a string
            if (!credentialResponse.credential || typeof credentialResponse.credential !== 'string') {
                throw new Error('Invalid Google credential format');
            }

            // Optional: Decode token to verify it's valid
            const decodedToken = jwtDecode<DecodedToken>(credentialResponse.credential);
            console.log('Decoded Google token:', decodedToken);

            // Verify token expiration
            if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                throw new Error('Google token has expired');
            }

            // Pass the full credential response to parent component
            if (onSuccess) {
                onSuccess(credentialResponse);
            }

        } catch (error: any) {
            console.error('Google token validation failed:', error);
            const errorMessage = error.message || 'Failed to process Google credential';
            if (onError) {
                onError(errorMessage);
            }
        }
    };

    const handleError = () => {
        const errorMessage = 'Google login failed. Please try again or use another method.';
        console.error(errorMessage);
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
            auto_select
        />
    );
};

export default GoogleLoginButton;