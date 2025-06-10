// src/Pages/Admin/Grade/CreateGradePopup.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { GradeCreationData } from './GradesPage'; // Import shared type
 // Import shared type

interface CreateGradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gradeData: GradeCreationData) => Promise<void>;
}

const CreateGradePopup: React.FC<CreateGradePopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const initialFormData = { gradeLevel: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ gradeLevel?: string; }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.gradeLevel) {
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    if (!formData.gradeLevel.trim()) {
      setErrors({ gradeLevel: "Grade Level is required" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Submission failed in popup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">Create New Grade</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close">
              <FaTimes size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.gradeLevel ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors.gradeLevel ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`}
                placeholder="e.g., 1st Grade, 10th Class"
              />
              {errors.gradeLevel && <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors disabled:bg-gray-400">
                {isSubmitting ? 'Creating...' : 'Create Grade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateGradePopup;