// EditSchool.tsx (or EditSchoolPopup.tsx) - CORRECTED

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { SchoolCreationData } from './SchoolsPage';
import { API_ENDPOINTS } from "../../../API/apiConfig"; // Assuming this path is correct
import { toast } from 'sonner';

// --- Type Definitions ---
// These types are for the data returned by the API
interface CountryAPIResponse { id: number; countryName: string; }
interface StateAPIResponse { id: number; stateName: string; }
interface CityAPIResponse { id: number; cityName: string; }

// This is a generic type for our dropdown lists
type DropdownItem = { id: number; name: string; };

// This is the shape of the data the component expects as a prop
// Notice the property names: country, state, city. This now matches what SchoolsPage sends.
interface SchoolForEdit {
    id: number;
    name:string;
    address:string;
    country: string;
    state: string;
    city: string;
}

interface EditSchoolPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolCreationData, id: number) => Promise<void>;
  initialData: SchoolForEdit; // Corrected type here
}

const EditSchoolPopup: React.FC<EditSchoolPopupProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<SchoolCreationData>({ name: '', address: '', country: '', state: '', city: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolCreationData, string>>>({});
  const [countries, setCountries] = useState<DropdownItem[]>([]);
  const [states, setStates] = useState<DropdownItem[]>([]);
  const [cities, setCities] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState({ countries: false, states: false, cities: false, submitting: false });

  // This useEffect now correctly pre-fills the form
  useEffect(() => {
    if (!isOpen || !initialData) return;
    
    // Asynchronously load all dropdowns based on initialData
    const prefillForm = async () => {
        setLoading({ countries: true, states: true, cities: true, submitting: false });
        try {
            // 1. Fetch all countries and find the ID for the initial country name
            const countryRes = await fetch(API_ENDPOINTS.GetAllCountries);
            const countryData: CountryAPIResponse[] = await countryRes.json();
            const populatedCountries = countryData.map(c => ({ id: c.id, name: c.countryName }));
            setCountries(populatedCountries);
            const countryId = populatedCountries.find(c => c.name === initialData.country)?.id;

            if (!countryId) throw new Error("Initial country not found");

            // 2. Fetch states for that country and find the ID for the initial state name
            const stateRes = await fetch(`${API_ENDPOINTS.GetStatesByCountry}/${countryId}`);
            const stateData: StateAPIResponse[] = await stateRes.json();
            const populatedStates = stateData.map(s => ({ id: s.id, name: s.stateName }));
            setStates(populatedStates);
            const stateId = populatedStates.find(s => s.name === initialData.state)?.id;

            if (!stateId) throw new Error("Initial state not found");

            // 3. Fetch cities for that state and find the ID for the initial city name
            const cityRes = await fetch(`${API_ENDPOINTS.GetCitiesByState}/${stateId}`);
            const cityData: CityAPIResponse[] = await cityRes.json();
            const populatedCities = cityData.map(c => ({ id: c.id, name: c.cityName }));
            setCities(populatedCities);
            const cityId = populatedCities.find(c => c.name === initialData.city)?.id;

            if (!cityId) throw new Error("Initial city not found");

            // 4. Set the form data with all the found IDs
            setFormData({
                name: initialData.name,
                address: initialData.address,
                country: countryId,
                state: stateId,
                city: cityId,
            });

        } catch (error) {
            console.error("Failed to pre-fill form:", error);
            toast.error("Could not load initial school data.");
            onClose(); // Close the popup if data can't be loaded
        } finally {
            setLoading({ countries: false, states: false, cities: false, submitting: false });
        }
    };
    
    prefillForm();
  }, [isOpen, initialData, onClose]);

  // These effects handle dropdown changes AFTER the initial load
  useEffect(() => {
    // Prevent this from running on the initial render when country is set programmatically
    if (!formData.country || loading.countries) return; 
    
    const fetchStates = async () => {
        setLoading(p => ({ ...p, states: true, cities: true }));
        setStates([]);
        setCities([]);
        try {
            const res = await fetch(`${API_ENDPOINTS.GetStatesByCountry}/${formData.country}`);
            const data: StateAPIResponse[] = await res.json();
            setStates(data.map(s => ({id: s.id, name: s.stateName})));
        } finally {
            setLoading(p => ({ ...p, states: false, cities: false }));
        }
    };
    fetchStates();
  }, [formData.country]);

  useEffect(() => {
    // Prevent this from running on the initial render when state is set programmatically
    if (!formData.state || loading.states) return;
    
    const fetchCities = async () => {
        setLoading(p => ({ ...p, cities: true }));
        setCities([]);
        try {
            const res = await fetch(`${API_ENDPOINTS.GetCitiesByState}/${formData.state}`);
            const data: CityAPIResponse[] = await res.json();
            setCities(data.map(c => ({id: c.id, name: c.cityName})));
        } finally {
            setLoading(p => ({...p, cities: false}));
        }
    };
    fetchCities();
  }, [formData.state]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    if (name === 'country') {
      newFormData.state = '';
      newFormData.city = '';
    }
    if (name === 'state') {
      newFormData.city = '';
    }

    setFormData(newFormData);
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
    await onSubmit(formData, initialData.id);
    setLoading(p => ({ ...p, submitting: false }));
  };

  if (!isOpen) return null;

  const inputErrorClass = (field: keyof SchoolCreationData) => `w-full px-3 py-2 border rounded-md ${errors[field] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-500' : 'focus:ring-[#d58e39]'}`;

  // The JSX part remains the same
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center border-b p-3">
            <h2 className="text-xl font-semibold text-gray-800">Edit School</h2>
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
                {loading.submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditSchoolPopup;