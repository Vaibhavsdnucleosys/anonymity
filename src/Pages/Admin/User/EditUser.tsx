// src/Pages/Admin/User/EditUser.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { API_ENDPOINTS } from '../../../API/apiConfig'; // <<<< Verify this path
import { toast } from 'sonner';

// This interface should match the data structure returned by your API for a single user
// and also what UsersPage expects for the update submission.
interface UserDataForEditForm {
  id: number;
  name: string;
  userName: string;
  email: string;
  roleId?: number; // Optional, based on your API and form needs
  // Add any other fields your API returns and you need to edit
}

interface EditUserProps {
  id: number;
  onClose: () => void;
  onSubmit: (updatedUserData: UserDataForEditForm) => void;
}

const EditUser: React.FC<EditUserProps> = ({ id, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<UserDataForEditForm>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Omit<UserDataForEditForm, 'id'>>>({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // API_ENDPOINTS.User should be the base URL for user, e.g., "http://.../api/User"
        // The GET request will be to "http://.../api/User/{id}"
        const response = await axios.get<UserDataForEditForm>(`${API_ENDPOINTS.User}/${id}`);
        
        if (response.data) {
          setFormData(response.data);
        } else {
          // This case might not be typical for a GET by ID if the ID is valid
          // but good for robustness
          console.warn(`No data received for user ID ${id}`);
          setError("User details not found or unexpected response.");
          toast.error("User details not found.");
        }

      } catch (err: any) { // Using 'any' for err to access err.response
        console.error(`Error fetching user details for ID ${id}:`, err);
        let errorMessage = "Failed to load user details.";
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            errorMessage = `User with ID ${id} not found.`;
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Ensure roleId is parsed as a number if it's part of your form
    const val = name === 'roleId' ? (value === '' ? undefined : parseInt(value, 10)) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (formErrors[name as keyof Omit<UserDataForEditForm, 'id'>]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<UserDataForEditForm, 'id'>> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required.";
    if (!formData.userName?.trim()) newErrors.userName = "Username is required.";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required.";
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    // Add validation for roleId if it's mandatory
    // if (formData.roleId === undefined || formData.roleId === null) {
    //   newErrors.roleId = "Role is required.";
    // }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure all required fields for submission are present in formData
      // The 'as UserDataForEditForm' cast assumes formData now holds all necessary fields
      // This is generally safe if your form covers all fields or defaults are handled server-side
      if (formData.id !== undefined && formData.name && formData.userName && formData.email) {
         onSubmit(formData as UserDataForEditForm);
      } else {
        console.error("Form data is incomplete for submission:", formData);
        toast.error("Some required fields are missing. Cannot save changes.");
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg text-center">
          <HashLoader color="#d58e39" size={50} />
          <p className="mt-4 text-gray-700">Loading User Details...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.id) { // Show full error screen only if data couldn't be loaded at all
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-red-600">Error Loading User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes size={20}/></button>
          </div>
          <p className="text-red-500">{error}</p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 animate-modalShow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit User (ID: {formData.id || id})</h2>
           <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
            title="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {error && formData.id && ( // Display non-critical error (e.g., if loading failed but form is still usable with stale data, or a warning)
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                <p><strong>Notice:</strong> {error}</p>
                <p className="text-sm">You can still try to save, or close and try again.</p>
            </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          {/* <div className="mb-4">
            <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="editName"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.name ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'} focus:border-transparent sm:text-sm`}
              disabled={!formData.id} // Disable if initial load failed badly
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div> */}

          <div className="mb-4">
            <label htmlFor="editUserName" className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="editUserName"
              name="userName"
              value={formData.userName || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${formErrors.userName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.userName ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'} focus:border-transparent sm:text-sm`}
              disabled={!formData.id}
            />
            {formErrors.userName && <p className="text-xs text-red-500 mt-1">{formErrors.userName}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="editEmail"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.email ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'} focus:border-transparent sm:text-sm`}
              disabled={!formData.id}
            />
            {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
          </div>
          
          {/* Role ID Dropdown - uncomment and adjust if you have roles and a way to fetch them */}
          {/*
          <div className="mb-6">
            <label htmlFor="editRoleId" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="editRoleId"
              name="roleId"
              value={formData.roleId === undefined ? '' : formData.roleId} // Handle undefined for placeholder
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${formErrors.roleId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.roleId ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'} focus:border-transparent sm:text-sm`}
              disabled={!formData.id}
            >
              <option value="" disabled>Select a role</option> 
              <option value={1}>Admin</option>
              <option value={2}>User</option>
              // Ideally, fetch roles from an API
            </select>
            {formErrors.roleId && <p className="text-xs text-red-500 mt-1">{formErrors.roleId}</p>}
          </div>
          */}

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#d58e39] hover:bg-[#b86807] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#d58e39] focus:ring-offset-2"
              disabled={!formData.id || loading} // Disable if still loading or initial load failed
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
          @keyframes modalShow {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-modalShow {
            animation: modalShow 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default EditUser;