import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import {
    FaSearch,
    FaSchool,
    FaMapMarkerAlt,
    FaStar,
    FaQuestionCircle as FaQuestion,
    FaInfoCircle,
    FaEdit,
    FaTimes,
    FaSpinner,
} from "react-icons/fa";
import { API_ENDPOINTS } from "../../API/apiConfig";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// --- Interfaces for API Data & Dropdowns ---
interface School { id: number; schoolName: string; }
interface Country { id: number; countryName: string; }
interface State { id: number; stateName: string; }
interface City { id: number; cityName: string; }
type DropdownItem = { id: number; name: string; };

// --- Interfaces for Search Result API Response ---
interface ReviewDetails {
    id: number;
    schoolId: number;
    gradeLevel: string;
    overallRating: number;
}
interface SearchResult {
    schoolName: string;
    countryId: number;
    stateId: number;
    cityId: number;
    reviewDetails: ReviewDetails;
}

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

    const generateYears = (startYear: number) => Array.from({ length: 12 }, (_, i) => startYear - 5 + i);

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

// --- Helper to convert rating to display details ---
const getRatingDetails = (rating: number) => {
    if (rating >= 4.5) return { text: "Great school for Guest Teachers!", color: "green", grade: "A", stars: 5 };
    if (rating >= 3.5) return { text: "Good school for Guest Teachers!", color: "blue", grade: "B", stars: 4 };
    if (rating >= 2.5) return { text: "Average experience", color: "yellow", grade: "C", stars: 3 };
    if (rating >= 1.5) return { text: "Below average experience", color: "orange", grade: "D", stars: 2 };
    if (rating >= 1) return { text: "Not recommended", color: "red", grade: "F", stars: 1 };
    return { text: "Not enough info", color: "gray", grade: "N/A", stars: 0 };
};

// --- Component for a single search result card ---
const SearchResultCard: React.FC<{ result: SearchResult }> = ({ result }) => {
    const navigate = useNavigate();
    const ratingDetails = getRatingDetails(result.reviewDetails.overallRating);
    const starCount = Math.round(ratingDetails.stars);
    const location = "Location, ST"; // Placeholder, you may want to derive this

    return (
        <div className={`school-card p-6 bg-white rounded-xl shadow-md mb-5 border-l-4 border-${ratingDetails.color}-500 bg-${ratingDetails.color}-50/10`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h5 className={`text-lg font-semibold mb-1 flex items-center`}>
                        <FaSchool className={`text-${ratingDetails.color}-600 mr-2`} />
                        {result.schoolName}
                    </h5>
                    <small className="text-gray-500 flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {result.reviewDetails.gradeLevel} • {location}
                    </small>
                </div>
                <div className="text-right">
                    <span className={`badge bg-${ratingDetails.color}-500 ${ratingDetails.color === 'yellow' ? 'text-gray-800' : 'text-white'} px-3 py-1 rounded-full text-sm`}>
                        {ratingDetails.text}
                    </span>
                    <div className="mt-2">
                        <strong>Grade: {ratingDetails.grade}</strong>
                        <div className="inline-flex items-center ml-2">
                            {[...Array(starCount)].map((_, i) => <FaStar key={`star-${i}`} className="text-yellow-400 text-sm" />)}
                            {[...Array(5 - starCount)].map((_, i) => <FaStar key={`empty-star-${i}`} className="text-gray-300 text-sm" />)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/schools/${result.reviewDetails.schoolId}`) }} className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline mr-4 inline-flex items-center">
                    <FaInfoCircle className="mr-1" />View Details
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/submit-report') }} className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center">
                    <FaEdit className="mr-1" />Submit Report
                </a>
            </div>
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
        schoolLevel: "",
        SearchText: "" 
    };
    const [searchCriteria, setSearchCriteria] = useState(initialFormState);

    const [countries, setCountries] = useState<DropdownItem[]>([]);
    const [states, setStates] = useState<DropdownItem[]>([]);
    const [cities, setCities] = useState<DropdownItem[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
    const [isSchoolDropdownVisible, setIsSchoolDropdownVisible] = useState(false);
    const schoolDropdownRef = useRef<HTMLDivElement>(null);
    
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState({ countries: false, states: false, cities: false, schools: false, isSearching: false });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(prev => ({ ...prev, countries: true, schools: true }));
            try {
                const [countriesResponse, schoolsResponse] = await Promise.all([
                    axios.get<Country[]>(API_ENDPOINTS.GetAllCountries),
                    axios.get<School[]>(API_ENDPOINTS.GetAllSchools),
                ]);

                if (Array.isArray(countriesResponse.data)) {
                    setCountries(countriesResponse.data.map(c => ({ id: c.id, name: c.countryName })));
                }
                if (Array.isArray(schoolsResponse.data)) {
                    setSchools(schoolsResponse.data);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                toast.error("Could not load initial data. Please refresh the page.");
            } finally {
                setIsLoading(prev => ({ ...prev, countries: false, schools: false }));
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!searchCriteria.countryId) {
            setStates([]);
            setCities([]);
            return;
        }
        const fetchStates = async () => {
            setIsLoading(prev => ({ ...prev, states: true }));
            try {
                const response = await axios.get<State[]>(`${API_ENDPOINTS.GetStatesByCountry}/${searchCriteria.countryId}`);
                if (Array.isArray(response.data)) {
                    setStates(response.data.map(state => ({ id: state.id, name: state.stateName })));
                }
            } catch (error) {
                toast.error("Could not load states for the selected country.");
                setStates([]);
            } finally {
                setIsLoading(prev => ({ ...prev, states: false }));
            }
        };
        fetchStates();
    }, [searchCriteria.countryId]);

    useEffect(() => {
        if (!searchCriteria.stateId) {
            setCities([]);
            return;
        }
        const fetchCities = async () => {
            setIsLoading(prev => ({ ...prev, cities: true }));
            try {
                const response = await axios.get<City[]>(`${API_ENDPOINTS.GetCitiesByState}/${searchCriteria.stateId}`);
                if (Array.isArray(response.data)) {
                    setCities(response.data.map(city => ({ id: city.id, name: city.cityName })));
                }
            } catch (error) {
                toast.error("Could not load cities for the selected state.");
                setCities([]);
            } finally {
                setIsLoading(prev => ({ ...prev, cities: false }));
            }
        };
        fetchCities();
    }, [searchCriteria.stateId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
                setIsSchoolDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchCriteria(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'countryId') {
                newState.stateId = "";
                newState.cityId = "";
            }
            if (name === 'stateId') {
                newState.cityId = "";
            }
            return newState;
        });
    };

    const handleSchoolSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSchoolSearchTerm(value);
        setSearchCriteria(prev => ({ ...prev, schoolName: value }));
        if (!isSchoolDropdownVisible) setIsSchoolDropdownVisible(true);
    };
    const handleSchoolSelect = (school: School) => {
        setSchoolSearchTerm(school.schoolName);
        setSearchCriteria(prev => ({ ...prev, schoolName: school.schoolName }));
        setIsSchoolDropdownVisible(false);
    };

    const handleYearChange = (year: string) => {
        setSearchCriteria(prev => ({ ...prev, schoolYear: year }));
    };

    const handleReset = () => {
        setSearchCriteria(initialFormState);
        setSchoolSearchTerm("");
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(prev => ({ ...prev, isSearching: true }));
        setHasSearched(true);
        setSearchResults([]);

        const activeCriteria: { [key: string]: any } = {};
        for (const key in searchCriteria) {
            if (searchCriteria[key as keyof typeof searchCriteria]) {
                activeCriteria[key] = searchCriteria[key as keyof typeof searchCriteria];
            }
        }

        try {
            const response = await axios.get<SearchResult[]>(API_ENDPOINTS.SearchReviews, {
                params: activeCriteria
            });
            if (Array.isArray(response.data)) {
                setSearchResults(response.data);
                if (response.data.length > 0) {
                    toast.success(`Found ${response.data.length} review(s).`);
                }
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("An error occurred during the search. Please try again.");
        } finally {
            setIsLoading(prev => ({ ...prev, isSearching: false }));
        }
    };

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
                        <div><label htmlFor="schoolYear" className={labelStyle}>School Year</label><YearPicker selectedYear={searchCriteria.schoolYear} onChange={handleYearChange} /></div>
                        
                        <div>
                            <label htmlFor="schoolName" className={labelStyle}>School Name</label>
                            <div className="relative" ref={schoolDropdownRef}>
                                <input type="text" id="schoolName" name="schoolName" className={inputStyle} placeholder={isLoading.schools ? "Loading schools..." : "Search for a school"} value={schoolSearchTerm} onChange={handleSchoolSearchChange} onFocus={() => setIsSchoolDropdownVisible(true)} disabled={isLoading.schools} autoComplete="off" />
                                {isSchoolDropdownVisible && (
                                    <ul className="absolute top-full mt-1 w-full bg-white border rounded-md max-h-52 overflow-y-auto z-20 list-none p-2 shadow-lg">
                                        {isLoading.schools ? <li className="px-3 py-2 text-sm text-gray-500">Loading...</li> : filteredSchools.length > 0 ? (filteredSchools.map(school => (<li key={school.id} className="px-3 py-2 cursor-pointer text-sm rounded-md hover:bg-indigo-50" onClick={() => handleSchoolSelect(school)}>{school.schoolName}</li>))) : (<li className="px-3 py-2 text-sm text-gray-500">{schoolSearchTerm ? "No schools found" : "Type to search..."}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="SearchText" className={labelStyle}>Teacher Name or Comments</label>
                            <div className="relative">
                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    id="SearchText"
                                    name="SearchText"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder="e.g., Teacher name, 'helpful'..."
                                    value={searchCriteria.SearchText}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div><label htmlFor="countryId" className={labelStyle}>Country</label><select id="countryId" name="countryId" className={`${inputStyle} disabled:bg-gray-100`} value={searchCriteria.countryId} onChange={handleInputChange} disabled={isLoading.countries}><option value="">Any Country</option>{countries.map(country => (<option key={country.id} value={country.id}>{country.name}</option>))}</select></div>
                        <div><label htmlFor="stateId" className={labelStyle}>State/Province</label><select id="stateId" name="stateId" className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`} value={searchCriteria.stateId} onChange={handleInputChange} disabled={!searchCriteria.countryId || isLoading.states}><option value="">{isLoading.states ? 'Loading...' : 'Any State'}</option>{states.map(state => (<option key={state.id} value={state.id}>{state.name}</option>))}</select></div>
                        <div><label htmlFor="cityId" className={labelStyle}>City</label><select id="cityId" name="cityId" className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`} value={searchCriteria.cityId} onChange={handleInputChange} disabled={!searchCriteria.stateId || isLoading.cities}><option value="">{isLoading.cities ? 'Loading...' : 'Any City'}</option>{cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}</select></div>
                        <div className="lg:col-span-3"><label htmlFor="schoolLevel" className={labelStyle}>School Level</label><select id="schoolLevel" name="schoolLevel" className={inputStyle} value={searchCriteria.schoolLevel} onChange={handleInputChange}><option value="">Any Level</option><option value="Elementary">Elementary</option><option value="Middle/Jr">Middle/Jr</option><option value="High School">High School</option><option value="Preparatory">Preparatory</option></select></div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                        <button type="button" onClick={handleReset} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all inline-flex items-center">
                            <FaTimes className="mr-2" /> Reset
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 hover:-translate-y-0.5 transform transition-all shadow hover:shadow-lg inline-flex items-center disabled:bg-indigo-400 disabled:cursor-not-allowed" disabled={isLoading.isSearching}>
                            {isLoading.isSearching ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
                            {isLoading.isSearching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>
            </section>

            {hasSearched && (
                <section id="searchResults" className="container my-12 animate-fadeIn">
                    {isLoading.isSearching ? (
                        <div className="text-center py-10">
                            <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto" />
                            <p className="mt-4 text-gray-600">Fetching results...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h5 className="font-semibold text-lg">Search Results</h5>
                                <div className="text-gray-500">Showing {searchResults.length} result(s)</div>
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
                            {searchResults.map((result) => (
                                <SearchResultCard key={result.reviewDetails.id} result={result} />
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-md">
                            <FaSearch className="text-5xl text-gray-400 mx-auto" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">No Reviews Found</h3>
                            <p className="mt-2 text-gray-500">Your search did not match any reviews. Try adjusting your filters.</p>
                        </div>
                    )}
                </section>
            )}
        </>
    );
};

export default BrowseSchools;