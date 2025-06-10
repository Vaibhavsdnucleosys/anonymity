import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import {
  FaSearch,
  FaSchool,
  FaMapMarkerAlt,
  FaStar,
  FaStarHalfAlt,
  FaQuestionCircle as FaQuestion,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaInfoCircle,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { API_ENDPOINTS } from "../../API/apiConfig"; // Adjust path if necessary
import { toast } from "sonner";

// --- Interfaces for API Data & Dropdowns ---
interface School { id: number; schoolName: string; }
interface Country { id: number; countryName: string; }
interface State { id: number; stateName: string; }
interface City { id: number; cityName: string; }
type DropdownItem = { id: number; name: string; };

// --- Custom Year Picker Component ---
interface YearPickerProps {
  selectedYear: string;
  onChange: (year: string) => void;
}
const YearPicker: React.FC<YearPickerProps> = ({ selectedYear, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialYear = selectedYear ? parseInt(selectedYear.split('-')[0], 10) : new Date().getFullYear();
  const [displayYear, setDisplayYear] = useState(initialYear);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearSelect = (year: number) => {
    onChange(`${year}-${year + 1}`);
    setIsOpen(false);
  };

  const generateYears = (startYear: number) => {
    const years = [];
    for (let i = -5; i <= 6; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const years = generateYears(displayYear);
  const currentYear = new Date().getFullYear();
  const selectedStartYear = selectedYear ? parseInt(selectedYear.split('-')[0], 10) : null;
  const buttonStyle = "block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-sm placeholder-gray-400 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left flex justify-between items-center";

  return (
    <div className="relative" ref={pickerRef}>
      <button type="button" className={buttonStyle} onClick={() => setIsOpen(!isOpen)}>
        {selectedYear || <span className="text-gray-500">Any Year</span>}
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-20 p-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <button type="button" className="font-bold text-lg hover:bg-gray-100 rounded-full w-8 h-8" onClick={() => setDisplayYear(y => y - 12)}>«</button>
            <span className="font-semibold">{years[0]} - {years[years.length - 1]}</span>
            <button type="button" className="font-bold text-lg hover:bg-gray-100 rounded-full w-8 h-8" onClick={() => setDisplayYear(y => y + 12)}>»</button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {years.map(year => {
              const isSelected = year === selectedStartYear;
              const isCurrent = year === currentYear;
              return (<button key={year} type="button" onClick={() => handleYearSelect(year)} className={`p-2 rounded-md text-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white font-bold' : isCurrent ? 'border border-indigo-500 text-indigo-600' : 'hover:bg-gray-100'}`}>{year}</button>);
            })}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main BrowseSchools Component ---
const BrowseSchools = () => {
  const initialFormState = {
    countryId: "",
    stateId: "",
    cityId: "",
    schoolYear: "",
    schoolName: "",
    teacherName: "",
    schoolLevel: "",
  };

  const [searchCriteria, setSearchCriteria] = useState(initialFormState);
  
  // State for dropdown data
  const [countries, setCountries] = useState<DropdownItem[]>([]);
  const [states, setStates] = useState<DropdownItem[]>([]);
  const [cities, setCities] = useState<DropdownItem[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  // State for school search functionality (as per reference component)
  const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
  const [isSchoolDropdownVisible, setIsSchoolDropdownVisible] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for loading indicators
  const [isLoading, setIsLoading] = useState({ countries: false, states: false, cities: false, schools: false });

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(prev => ({ ...prev, countries: true, schools: true }));
      try {
        const [countriesRes, schoolsRes] = await Promise.all([
          axios.get<Country[]>(API_ENDPOINTS.GetAllCountries),
          axios.get<School[]>(API_ENDPOINTS.GetAllSchools)
        ]);
        if (Array.isArray(countriesRes.data)) setCountries(countriesRes.data.map(c => ({ id: c.id, name: c.countryName })));
        if (Array.isArray(schoolsRes.data)) setSchools(schoolsRes.data.filter(s => s && typeof s.schoolName === 'string'));
      } catch (error) {
        toast.error("Failed to load search options.");
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, countries: false, schools: false }));
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!searchCriteria.countryId) { setStates([]); setCities([]); return; }
    const fetchStates = async () => {
      setIsLoading(prev => ({ ...prev, states: true }));
      setStates([]); setCities([]);
      try {
        const response = await axios.get<State[]>(`${API_ENDPOINTS.GetStatesByCountry}/${searchCriteria.countryId}`);
        if (Array.isArray(response.data)) setStates(response.data.map(s => ({ id: s.id, name: s.stateName })));
      } catch (error) { toast.error("Could not load states for the selected country."); } 
      finally { setIsLoading(prev => ({ ...prev, states: false })); }
    };
    fetchStates();
  }, [searchCriteria.countryId]);

  useEffect(() => {
    if (!searchCriteria.stateId) { setCities([]); return; }
    const fetchCities = async () => {
      setIsLoading(prev => ({ ...prev, cities: true }));
      setCities([]);
      try {
        const response = await axios.get<City[]>(`${API_ENDPOINTS.GetCitiesByState}/${searchCriteria.stateId}`);
        if (Array.isArray(response.data)) setCities(response.data.map(c => ({ id: c.id, name: c.cityName })));
      } catch (error) { toast.error("Could not load cities for the selected state."); } 
      finally { setIsLoading(prev => ({ ...prev, cities: false })); }
    };
    fetchCities();
  }, [searchCriteria.stateId]);

  // Effect to close school dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setIsSchoolDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'countryId') { newState.stateId = ""; newState.cityId = ""; }
        if (name === 'stateId') { newState.cityId = ""; }
        return newState;
    });
  };
  
  // School search input handler (from reference)
  const handleSchoolSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSchoolSearchTerm(value);
    setSearchCriteria(prev => ({ ...prev, schoolName: value }));
    if (!isSchoolDropdownVisible) setIsSchoolDropdownVisible(true);
  };

  // School selection handler (from reference)
  const handleSchoolSelect = (school: School) => {
    setSchoolSearchTerm(school.schoolName);
    setSearchCriteria(prev => ({ ...prev, schoolName: school.schoolName }));
    setIsSchoolDropdownVisible(false);
  };

  const handleYearChange = (year: string) => { setSearchCriteria(prev => ({ ...prev, schoolYear: year })); };
  const handleReset = () => { setSearchCriteria(initialFormState); setSchoolSearchTerm(""); };
  const handleSearchSubmit = async (e: React.FormEvent) => { e.preventDefault(); console.log("Searching with:", searchCriteria); toast.info("Search functionality is in development."); };

  // Filter schools based on the search term (from reference)
  const filteredSchools = schools.filter(school => school.schoolName.toLowerCase().includes(schoolSearchTerm.toLowerCase()));
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "block w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-sm placeholder-gray-400 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <>
      <section id="browseSchools" className="container my-12 animate-fadeIn">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Browse & Review Schools</h1>
            <p className="mt-2 text-lg text-gray-500">Find schools, view ratings, and share your experience.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl shadow-lg p-6 lg:p-8 max-w-6xl mx-auto border-t-4 border-indigo-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* School Year */}
            <div>
              <label htmlFor="schoolYear" className={labelStyle}>School Year</label>
              <YearPicker selectedYear={searchCriteria.schoolYear} onChange={handleYearChange} />
            </div>
            {/* School Name (Searchable Dropdown - As per reference) */}
            <div>
              <label htmlFor="schoolName" className={labelStyle}>School Name</label>
              <div className="relative" ref={schoolDropdownRef}>
                <input 
                  type="text" 
                  id="schoolName" 
                  name="schoolName" 
                  className={inputStyle} 
                  placeholder={isLoading.schools ? "Loading schools..." : "Search for a school"} 
                  value={schoolSearchTerm} 
                  onChange={handleSchoolSearchChange} 
                  onFocus={() => setIsSchoolDropdownVisible(true)} 
                  disabled={isLoading.schools} 
                  autoComplete="off" 
                />
                {isSchoolDropdownVisible && (
                  <ul className="absolute top-full mt-1 w-full bg-white border rounded-md max-h-52 overflow-y-auto z-20 list-none p-2 shadow-lg">
                    {isLoading.schools ? (
                      <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
                    ) : filteredSchools.length > 0 ? (
                      filteredSchools.map(school => (
                        <li 
                          key={school.id} 
                          className="px-3 py-2 cursor-pointer text-sm rounded-md hover:bg-indigo-50" 
                          onClick={() => handleSchoolSelect(school)}
                        >
                          {school.schoolName}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-gray-500">
                        {schoolSearchTerm ? "No schools found" : "Type to search..."}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Teacher Name */}
            <div>
              <label htmlFor="teacherName" className={labelStyle}>Teacher Name</label>
              <input type="text" id="teacherName" name="teacherName" className={inputStyle} placeholder="Enter first or last name" value={searchCriteria.teacherName} onChange={handleInputChange}/>
            </div>


            {/* Country */}
            <div>
              <label htmlFor="countryId" className={labelStyle}>Country</label>
              <select id="countryId" name="countryId" className={`${inputStyle} disabled:bg-gray-100`} value={searchCriteria.countryId} onChange={handleInputChange} disabled={isLoading.countries}>
                <option value="">{isLoading.countries ? 'Loading...' : 'Any Country'}</option>
                {countries.map(country => (<option key={country.id} value={country.id}>{country.name}</option>))}
              </select>
            </div>

            {/* State/Province */}
            <div>
              <label htmlFor="stateId" className={labelStyle}>State/Province</label>
              <select id="stateId" name="stateId" className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`} value={searchCriteria.stateId} onChange={handleInputChange} disabled={!searchCriteria.countryId || isLoading.states}>
                <option value="">{isLoading.states ? 'Loading...' : 'Any State'}</option>
                {states.map(state => (<option key={state.id} value={state.id}>{state.name}</option>))}
              </select>
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="cityId" className={labelStyle}>City</label>
              <select id="cityId" name="cityId" className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`} value={searchCriteria.cityId} onChange={handleInputChange} disabled={!searchCriteria.stateId || isLoading.cities}>
                <option value="">{isLoading.cities ? 'Loading...' : 'Any City'}</option>
                {cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
              </select>
            </div>

            {/* School Level */}
            <div>
              <label htmlFor="schoolLevel" className={labelStyle}>School Level</label>
              <select id="schoolLevel" name="schoolLevel" className={inputStyle} value={searchCriteria.schoolLevel} onChange={handleInputChange}>
                <option value="">Any Level</option>
                <option value="Elementary">Elementary</option>
                <option value="Middle/Jr">Middle/Jr</option>
                <option value="High School">High School</option>
                <option value="Preparatory">Preparatory</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={handleReset} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all inline-flex items-center">
              <FaTimes className="mr-2" /> Reset
            </button>
            <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 hover:-translate-y-0.5 transform transition-all shadow hover:shadow-lg inline-flex items-center">
              <FaSearch className="mr-2" /> Search
            </button>
          </div>
        </form>
      </section>

      {/* --- Search Results Section (Unchanged) --- */}
      <section id="statistics" className="container my-12 animate-fadeIn animate-delay-500">
        <div className="flex justify-between items-center mb-6">
          <h5 className="font-semibold text-lg">Search Results</h5>
          <div className="text-gray-500">Showing 4 of 127 schools</div>
        </div>
        <div className="mb-6 p-3 bg-gray-100 border rounded-lg">
          <strong className="block mb-2">School Rating Categories</strong>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaStar className="mr-1" />Great (90-100%)</span>
            <span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaStar className="mr-1" />Good (80-89%)</span>
            <span className="badge bg-yellow-500 text-gray-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaStar className="mr-1" />Average (70-79%)</span>
            <span className="badge bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaStar className="mr-1" />Below avg (60-69%)</span>
            <span className="badge bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaStar className="mr-1" />Not recommended (50-59%)</span>
            <span className="badge bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center"><FaQuestion className="mr-1" />Not enough info</span>
          </div>
        </div>
        
        <div className="school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-blue-500 bg-blue-50/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h5 className="text-lg font-semibold mb-1 flex items-center"><FaSchool className="text-blue-600 mr-2" />Montclair Middle School</h5>
              <small className="text-gray-500 flex items-center"><FaMapMarkerAlt className="mr-1" />Middle/Jr • Montclair, CA</small>
            </div>
            <div className="text-right">
              <span className="badge bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Good school for Guest Teachers!</span>
              <div className="mt-2"><strong>Grade: 83% B-</strong><div className="inline-flex items-center ml-2">{[...Array(4)].map((_, i) => (<FaStar key={`montclair-star-${i}`} className="text-yellow-400 text-sm" />))}<FaStarHalfAlt className="text-yellow-400 text-sm" /><span className="ml-1 text-sm text-gray-600">(24 reviews)</span></div></div>
            </div>
          </div>
          <div className="mt-4"><a href="#" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline mr-4 inline-flex items-center"><FaInfoCircle className="mr-1" />View Details</a><a href="#" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center"><FaEdit className="mr-1" />Submit Report</a></div>
        </div>
        <div className="school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-green-500 bg-green-50/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h5 className="text-lg font-semibold mb-1 flex items-center"><FaSchool className="text-green-600 mr-2" />Lincoln Elementary School</h5>
              <small className="text-gray-500 flex items-center"><FaMapMarkerAlt className="mr-1" />Elementary • Lincoln, CA</small>
            </div>
            <div className="text-right">
              <span className="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm">Great school for Guest Teachers!</span>
              <div className="mt-2"><strong>Grade: 92% A-</strong><div className="inline-flex items-center ml-2">{[...Array(5)].map((_, i) => (<FaStar key={`lincoln-star-${i}`} className="text-yellow-400 text-sm" />))}<span className="ml-1 text-sm text-gray-600">(18 reviews)</span></div></div>
            </div>
          </div>
          <div className="mt-4"><a href="#" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline mr-4 inline-flex items-center"><FaInfoCircle className="mr-1" />View Details</a><a href="#" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center"><FaEdit className="mr-1" />Submit Report</a></div>
        </div>

        <nav className="mt-8">
          <ul className="pagination flex justify-center gap-1">
            <li className="page-item disabled"><button className="page-link p-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50"><FaAngleDoubleLeft size={14}/></button></li>
            <li className="page-item active"><button className="page-link px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">1</button></li>
            <li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">2</button></li>
            <li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">3</button></li>
            <li className="page-item disabled"><button className="page-link px-4 py-2 rounded-lg text-gray-400 font-medium">...</button></li>
            <li className="page-item"><button className="page-link px-4 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">10</button></li>
            <li className="page-item"><button className="page-link p-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50"><FaAngleDoubleRight size={14}/></button></li>
          </ul>
        </nav>
      </section>
    </>
  );
};

export default BrowseSchools;