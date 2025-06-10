import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
// Import the shared type from the main page component where it's defined
// Define the UserCreationData type here if it's not available for import
export type UserCreationData = {
  userName: string;
  email: string;
  password: string;
  roleId: number;
  authProvider: string;
};

// Define the props the component will accept from its parent (UsersPage)
interface CreateUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserCreationData) => Promise<void>;
}

const CreateUserPopup: React.FC<CreateUserPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  // Initial state for the form data
  const initialFormData = {
    userName: '',
    email: '',
    password: '',
    roleId: 2, // Default role to 'User'
    authProvider: "Email",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ userName?: string; email?: string; password?: string; }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to reset the form whenever the popup is closed and reopened
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handles changes for all input and select fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for the field being edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validates the form data and sets errors if any
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles the form submission process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Calls the onSubmit function passed from the parent component
      await onSubmit({ ...formData, roleId: Number(formData.roleId) });
    } catch (error) {
      // The parent (UsersPage) will show an error toast.
      // This catch block prevents an unhandled promise rejection error in the console.
      console.error("Submission failed in popup:", error);
    } finally {
      // Ensure the submitting state is always reset, even if there's an error
      setIsSubmitting(false);
    }
  };

  // If the popup is not supposed to be open, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent overlay to "blur" the background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* The main popup modal, centered on the screen */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">Create New User</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.userName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors.userName ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`}
                  placeholder="Enter username"
                />
                {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
              </div>

              <div className="w-1/2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`}
                  placeholder="Enter email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="w-1/2">
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d58e39]"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>User</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUserPopup;