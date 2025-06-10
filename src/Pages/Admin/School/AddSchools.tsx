// AddSchoolPopup.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import type { SchoolCreationData } from './SchoolsPage';
import { API_ENDPOINTS } from "../../../API/apiConfig"; // Using the centralized endpoints

// Define types for the data we expect from the API
interface CountryAPIResponse {
    id: number;
    countryName: string;
}

interface StateAPIResponse {
    id: number;
    stateName: string;
}

interface CityAPIResponse {
    id: number;
    cityName: string;
}

// A generic type for our dropdowns
type DropdownItem = { 
    id: number; 
    name: string; 
};

interface AddSchoolPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolCreationData) => Promise<void>;
}

const AddSchoolPopup: React.FC<AddSchoolPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<SchoolCreationData>({ name: '', address: '', country: '', state: '', city: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolCreationData, string>>>({});
  
  const [countries, setCountries] = useState<DropdownItem[]>([]);
  const [states, setStates] = useState<DropdownItem[]>([]);
  const [cities, setCities] = useState<DropdownItem[]>([]);
  
  const [loading, setLoading] = useState({ countries: false, states: false, cities: false, submitting: false });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', address: '', country: '', state: '', city: '' });
      setErrors({});
      setCountries([]);
      setStates([]);
      setCities([]);
    }
  }, [isOpen]);

  // Fetch countries when the popup opens
  useEffect(() => {
    if (isOpen) {
      const fetchCountries = async () => {
        setLoading(p => ({ ...p, countries: true }));
        try {
          // Use the imported API_ENDPOINTS object
          const response = await fetch(API_ENDPOINTS.GetAllCountries);
          if (!response.ok) throw new Error('Failed to fetch countries');
          const data: CountryAPIResponse[] = await response.json();
          setCountries(data.map(c => ({ id: c.id, name: c.countryName })));
        } catch (error) {
          console.error("Error fetching countries:", error);
          toast.error("Could not load countries from the server.");
        } finally {
          setLoading(p => ({ ...p, countries: false }));
        }
      };
      fetchCountries();
    }
  }, [isOpen]);

  // Fetch states when a country is selected
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      setCities([]);
      return;
    }

    const fetchStates = async () => {
      setLoading(p => ({ ...p, states: true }));
      setStates([]);
      setCities([]);
      try {
        // Use the imported API_ENDPOINTS object
        const response = await fetch(`${API_ENDPOINTS.GetStatesByCountry}/${formData.country}`);
        if (!response.ok) throw new Error('Failed to fetch states');
        const data: StateAPIResponse[] = await response.json();
        setStates(data.map(s => ({ id: s.id, name: s.stateName })));
      } catch (error) {
        console.error("Error fetching states:", error);
        toast.error("Could not load states for the selected country.");
      } finally {
        setLoading(p => ({ ...p, states: false }));
      }
    };
    fetchStates();
  }, [formData.country]);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(p => ({ ...p, cities: true }));
      setCities([]);
      try {
        // Use the imported API_ENDPOINTS object
        const response = await fetch(`${API_ENDPOINTS.GetCitiesByState}/${formData.state}`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data: CityAPIResponse[] = await response.json();
        setCities(data.map(c => ({ id: c.id, name: c.cityName })));
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast.error("Could not load cities for the selected state.");
      } finally {
        setLoading(p => ({ ...p, cities: false }));
      }
    };
    fetchCities();
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'country') {
        setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
    if (name === 'state') {
        setFormData(prev => ({ ...prev, city: '' }));
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "School name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(p => ({ ...p, submitting: true }));
    await onSubmit(formData);
    setLoading(p => ({ ...p, submitting: false }));
  };

  if (!isOpen) return null;

  const inputErrorClass = (field: keyof SchoolCreationData) => `w-full px-3 py-2 border rounded-md ${errors[field] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center border-b p-3">
            <h2 className="text-xl font-semibold text-gray-800">Add New School</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close">
              <FaTimes size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">School Name <span className="text-red-500">*</span></label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputErrorClass('name')} placeholder="e.g., Springdale Public" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                <select id="country" name="country" value={formData.country} onChange={handleChange} disabled={loading.countries} className={`${inputErrorClass('country')} disabled:bg-gray-100`}>
                  <option value="">{loading.countries ? 'Loading...' : 'Select Country'}</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                <select id="state" name="state" value={formData.state} onChange={handleChange} disabled={!formData.country || loading.states} className={`${inputErrorClass('state')} disabled:bg-gray-100`}>
                  <option value="">{loading.states ? 'Loading...' : 'Select State'}</option>
                  {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <select id="city" name="city" value={formData.city} onChange={handleChange} disabled={!formData.state || loading.cities} className={`${inputErrorClass('city')} disabled:bg-gray-100`}>
                  <option value="">{loading.cities ? 'Loading...' : 'Select City'}</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <textarea id="address" name="address" rows={2} value={formData.address} onChange={handleChange} className={inputErrorClass('address')} placeholder="Enter full street address" />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={loading.submitting} className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors disabled:bg-gray-400">
                {loading.submitting ? 'Saving...' : 'Add School'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddSchoolPopup;