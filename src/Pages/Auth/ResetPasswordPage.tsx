// src/pages/Auth/ResetPasswordPage.tsx (example path)
import React, { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../API/apiConfig'; // Adjust path

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // For displaying errors on the page
    const [success, setSuccess] = useState<string | null>(null); // For displaying success on the page

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (resetToken) {
            setToken(resetToken);
            console.log("Reset token from URL:", resetToken);
        } else {
            toast.error("Invalid or missing password reset token.");
            console.error("ResetPasswordPage: No token found in URL.");
            navigate("/login"); // Or to a specific error page
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Password reset token is missing. Please use the link from your email.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors
        setSuccess(null); // Clear previous success

        try {
            // YOU NEED TO DEFINE THIS ENDPOINT IN apiConfig.ts
            // Example: ResetPassword: `${BASE_URL}/api/auth/reset-password`
            await axios.post(API_ENDPOINTS.ResetPassword, {
                token,
                newPassword,
                // confirmPassword // Only send if your backend specifically requires it for validation
            });
            setSuccess("Your password has been reset successfully! You can now log in with your new password.");
            toast.success("Password reset successfully!");
            setNewPassword('');
            setConfirmPassword('');
            // Redirect to login after a delay so user can see the success message
            setTimeout(() => {
                navigate("/login");
            }, 4000);
        } catch (err: any) {
            console.error("Error resetting password:", err);
            const errorMessage = err.response?.data?.message || "Failed to reset password. The link may be invalid, expired, or already used.";
            setError(errorMessage); // Display error on the page
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial check if token was invalid from the start (e.g., direct navigation without token)
    if (!searchParams.get('token') && !isLoading && !success) {
        // This condition helps avoid briefly showing the form if the token is immediately known to be missing.
        // We also check !success to ensure this doesn't render after a successful reset.
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-xl text-red-600">Invalid Request</p>
                <p className="text-gray-700 mt-2">Password reset token is missing or invalid.</p>
                <button onClick={() => navigate('/login')} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">Reset Your Password</h2>

                {success && (
                    <div className="text-center space-y-4">
                        <p className="text-green-600 bg-green-50 p-4 rounded-md text-lg">{success}</p>
                        <button onClick={() => navigate('/login')} className="w-full px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Proceed to Login
                        </button>
                    </div>
                )}

                {error && !success && (
                    <p className="text-red-600 bg-red-50 p-3 rounded-md text-center text-sm">{error}</p>
                )}

                {!success && (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !token} // Also disable if token somehow becomes null
                                className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting...
                                    </div>
                                ) : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;