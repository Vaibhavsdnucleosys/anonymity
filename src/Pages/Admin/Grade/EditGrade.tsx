// src/Pages/Admin/Grade/EditGrade.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { API_ENDPOINTS } from '../../../API/apiConfig';
import { toast } from 'sonner';
import type { Grade } from './GradesPage'; // Import shared type
 // Import shared type

interface EditGradeProps {
  id: number;
  onClose: () => void;
  onSubmit: (updatedGradeData: Grade) => void;
}

const EditGrade: React.FC<EditGradeProps> = ({ id, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Grade>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ gradeLevel?: string }>({});

  useEffect(() => {
    const fetchGradeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Grade>(`${API_ENDPOINTS.UpdateGrade}/${id}`);
        setFormData(response.data);
      } catch (err) {
        console.error(`Error fetching grade details for ID ${id}:`, err);
        const errorMessage = "Failed to load grade details.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGradeDetails();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors.gradeLevel) {
      setFormErrors({});
    }
  };

  const validateForm = (): boolean => {
    if (!formData.gradeLevel?.trim()) {
      setFormErrors({ gradeLevel: "Grade Level is required." });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (formData.id !== undefined && formData.gradeLevel) {
         onSubmit(formData as Grade);
      } else {
        toast.error("Form data is incomplete. Cannot save changes.");
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center">
          <HashLoader color="#d58e39" size={50} />
          <p className="mt-4 text-gray-700">Loading Grade Details...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-md">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Grade (ID: {id})</h2>
           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200" title="Close">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="editGradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editGradeLevel"
              name="gradeLevel"
              value={formData.gradeLevel || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${formErrors.gradeLevel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.gradeLevel ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`}
              placeholder="e.g., 1st Grade, 10th Class"
              disabled={!formData.id}
            />
            {formErrors.gradeLevel && <p className="text-xs text-red-500 mt-1">{formErrors.gradeLevel}</p>}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#d58e39] hover:bg-[#b86807] rounded-md shadow-sm" disabled={!formData.id || loading}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGrade;