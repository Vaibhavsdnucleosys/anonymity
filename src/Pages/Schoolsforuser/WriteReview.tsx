import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaPencilAlt, FaSchool, FaClipboardCheck, FaExclamationCircle, FaGraduationCap, FaTasks,
  FaUsers, FaHandsHelping, FaBookOpen, FaStar, FaPaperPlane
} from 'react-icons/fa';
import { toast } from 'sonner';

// Import your central API configuration file
import { API_ENDPOINTS } from '../../API/apiConfig';

// --- Interfaces ---
interface ReviewFormData {
  schoolYear: string;
  schoolName: string;
  environmentCheckboxes: { [key: string]: boolean };
  environmentComments: string;
  gradeLevel: string;
  gradeLevelComments: string;
  jobDescription: string;
  jobDescriptionComments: string;
  impactMade: string;
  impactCount: string;
  impactType: string;
  impactComments: string;
  staffSupport: string;
  staffSupportComments: string;
  lessonPlans: string;
  lessonPlansComments: string;
  overallRating: string;
  finalComments: string;
}

interface School {
  id: number;
  schoolName: string;
  address?: string;
  countryName?: string;
}

interface Grade {
  id: number;
  gradeLevel: string;
  isDeleted: boolean;
}

// --- YEAR PICKER COMPONENT (Unchanged) ---
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
    const schoolYear = `${year}-${year + 1}`;
    onChange(schoolYear);
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

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        className="w-full rounded-lg py-2 px-3 text-sm border border-gray-300 transition-all duration-300 focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/25 focus:outline-none bg-white text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedYear || <span className="text-gray-400">Select School Year</span>}
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-20 p-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <button type="button" className="font-bold text-lg hover:bg-gray-200 rounded-full w-8 h-8" onClick={() => setDisplayYear(displayYear - 12)}>«</button>
            <span className="font-semibold">{years[0]} - {years[years.length - 1]}</span>
            <button type="button" className="font-bold text-lg hover:bg-gray-200 rounded-full w-8 h-8" onClick={() => setDisplayYear(displayYear + 12)}>»</button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {years.map(year => {
              const isSelected = year === selectedStartYear;
              const isCurrent = year === currentYear;
              return (
                <button key={year} type="button" onClick={() => handleYearSelect(year)}
                  className={`p-2 rounded-md text-sm transition-colors ${isSelected ? 'bg-[#4361ee] text-white font-bold ring-2 ring-offset-2 ring-[#4361ee]' : !isSelected && isCurrent ? 'border border-[#4361ee] text-[#4361ee]' : !isSelected ? 'hover:bg-gray-100' : ''}`}>
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Helper function & Initial State ---
const getCurrentSchoolYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

const initialFormData: ReviewFormData = {
  schoolYear: getCurrentSchoolYear(),
  schoolName: '',
  environmentCheckboxes: {},
  environmentComments: '',
  gradeLevel: '',
  gradeLevelComments: '',
  jobDescription: '',
  jobDescriptionComments: '',
  impactMade: '',
  impactCount: '',
  impactType: '',
  impactComments: '',
  staffSupport: '',
  staffSupportComments: '',
  lessonPlans: '',
  lessonPlansComments: '',
  overallRating: '',
  finalComments: ''
};


// --- Main Component ---
const WriteReview: React.FC = () => {
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [isSchoolDropdownVisible, setIsSchoolDropdownVisible] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const response = await axios.get<School[]>(API_ENDPOINTS.GetAllSchools);
        if (Array.isArray(response.data)) {
          const validSchools = response.data.filter(school => school && typeof school.schoolName === 'string');
          setSchools(validSchools);
        } else {
          setSchools([]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]);
      } finally {
        setIsLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      setIsLoadingGrades(true);
      try {
        const response = await axios.get<Grade[]>(API_ENDPOINTS.GetAllGrades);
        if (Array.isArray(response.data)) {
          const activeGrades = response.data.filter(grade => grade && !grade.isDeleted);
          setGrades(activeGrades);
        } else {
          setGrades([]);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        setGrades([]);
      } finally {
        setIsLoadingGrades(false);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setIsSchoolDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSchoolSearchTerm(value);
    setFormData(prev => ({ ...prev, schoolName: value }));
    if (!isSchoolDropdownVisible) setIsSchoolDropdownVisible(true);
    setSelectedSchool(null);
  };

  const handleSchoolSelect = (school: School) => {
    setSchoolSearchTerm(school.schoolName);
    setFormData(prev => ({ ...prev, schoolName: school.schoolName }));
    setSelectedSchool(school);
    setIsSchoolDropdownVisible(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, environmentCheckboxes: { ...prev.environmentCheckboxes, [name]: checked } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let userId: number | undefined;

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error("You are not logged in. Please log in to submit a review.");
        setIsSubmitting(false);
        return;
      }

      const payloadData = JSON.parse(atob(token.split('.')[1]));
      
      // <<< FIX IS HERE: Changed from 'nameid' to 'id' to match your token >>>
      const idFromToken = payloadData.id;
      
      if (!idFromToken) {
        toast.error("Your session is invalid. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      userId = Number(idFromToken);

    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Your session has expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    
    const schoolId = selectedSchool?.id;
    const selectedGradeObject = grades.find(g => g.gradeLevel === formData.gradeLevel);
    const gradeId = selectedGradeObject?.id;

    if (!schoolId) {
      toast.error("Please select a valid school from the list.");
      setIsSubmitting(false);
      return;
    }
    if (!gradeId) {
      toast.error("Please select a grade level.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.overallRating) {
      toast.error("Please provide an overall rating.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      schoolId,
      userId,
      gradeId,
      schoolYear: formData.schoolYear,
      schoolName: formData.schoolName,
      environmentComments: formData.environmentComments,
      gradeLevel: formData.gradeLevel,
      gradeLevelComments: formData.gradeLevelComments,
      jobDescription: formData.jobDescription,
      jobDescriptionComments: formData.jobDescriptionComments,
      impactMade: formData.impactMade,
      impactCount: formData.impactCount,
      impactType: formData.impactType,
      impactComments: formData.impactComments,
      staffSupport: formData.staffSupport,
      staffSupportComments: formData.staffSupportComments,
      lessonPlans: formData.lessonPlans,
      lessonPlansComments: formData.lessonPlansComments,
      overallRating: Number(formData.overallRating),
      finalComments: formData.finalComments,
      environmentCheckboxes: formData.environmentCheckboxes,
    };

    try {
      await axios.post(API_ENDPOINTS.AddReview, payload);
      toast.success("Review submitted successfully!");
      setFormData(initialFormData);
      setSchoolSearchTerm('');
      setSelectedSchool(null);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TextareaNote: React.FC = () => (
    <div className="text-xs text-[#856404] bg-[#fff3cd] px-2 py-1 rounded-b-lg -mt-1 border-l-2 border-r-2 border-b-2 border-[#ffeeba] flex items-center gap-1">
      <FaExclamationCircle className="text-yellow-400" /> Please do NOT use any students' name or description!
    </div>
  );

  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(schoolSearchTerm.toLowerCase())
  );

  const formInputClasses = "w-full rounded-lg py-2 px-3 text-sm border border-gray-300 transition-all duration-300 focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/25 focus:outline-none bg-white";
  const formCheckInputClasses = "h-4 w-4 rounded border-gray-300 text-[#4361ee] focus:ring-[#4361ee]/50";
  const formCheckLabelClasses = "font-medium text-sm text-gray-700 ml-2 select-none";

  return (
    <div className="bg-[#f5f7ff] font-['Poppins',_sans_serif] text-[#070808] leading-relaxed min-h-screen py-8">
      <div className="container mx-auto px-4">
        <form className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-6xl mx-auto border border-gray-200/50" onSubmit={handleSubmit}>
          <h2 className="text-[#3a0ca3] font-bold text-2xl md:text-3xl mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#3a0ca3] after:rounded-full">
            <FaPencilAlt className="inline-block mr-3 text-[#4361ee]" /> Tell Us About Your Experience
          </h2>
          <div className="bg-[#fff3cd] p-4 border-l-4 border-[#ffeeba] rounded-lg text-[#856404] text-sm mb-8 shadow-md">
            <strong>IMPORTANT:</strong> Please do NOT use any students' name or description!
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-1 border border-gray-200/50">
            <h3 className="font-semibold text-[#3a0ca3] text-lg flex items-center mb-3">
              <FaSchool className="mr-2 text-[#4361ee]" /> School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="schoolYear" className="font-semibold text-sm text-gray-800 mb-2 block">School Year</label>
                <YearPicker selectedYear={formData.schoolYear} onChange={(year) => setFormData(prev => ({ ...prev, schoolYear: year }))} />
              </div>
              <div>
                <label htmlFor="schoolName" className="font-semibold text-sm text-gray-800 mb-2 block">School Name</label>
                <div className="relative" ref={schoolDropdownRef}>
                  <input type="text" id="schoolName" name="schoolName" className={formInputClasses} placeholder={isLoadingSchools ? "Loading schools..." : "Search and select a school"} value={schoolSearchTerm} onChange={handleSchoolSearchChange} onFocus={() => setIsSchoolDropdownVisible(true)} disabled={isLoadingSchools} autoComplete="off" />
                  {isSchoolDropdownVisible && (
                    <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-52 overflow-y-auto z-10 list-none p-2 mt-1 shadow-lg">
                      {isLoadingSchools ? (<li className="px-4 py-3 text-sm text-gray-500 cursor-default">Loading...</li>)
                        : filteredSchools.length > 0 ? (filteredSchools.map(school => (<li key={school.id} className="px-4 py-3 cursor-pointer transition-colors duration-200 text-sm rounded-md hover:bg-[#e0e7ff] hover:text-[#4361ee]" onClick={() => handleSchoolSelect(school)}>{school.schoolName}</li>)))
                          : (<li className="px-4 py-3 text-sm text-gray-500 cursor-default">{schoolSearchTerm ? "No schools found" : "Type to search..."}</li>)
                      }
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-1 border border-gray-200/50">
            <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center">
              <FaClipboardCheck className="mr-2 text-[#4361ee]" /> School Environment
            </h3>
            <label className="font-semibold text-sm text-gray-800 mb-2 block">
              What can I expect when I visit this school site?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="welcoming" name="welcoming" checked={!!formData.environmentCheckboxes.welcoming} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="welcoming">Welcoming</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="friendlyOffice" name="friendlyOffice" checked={!!formData.environmentCheckboxes.friendlyOffice} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="friendlyOffice">Friendly Office</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="helpfulSupport" name="helpfulSupport" checked={!!formData.environmentCheckboxes.helpfulSupport} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="helpfulSupport">Helpful Staff</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="teacherFriendly" name="teacherFriendly" checked={!!formData.environmentCheckboxes.teacherFriendly} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="teacherFriendly">Teacher Friendly</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="positiveAtmosphere" name="positiveAtmosphere" checked={!!formData.environmentCheckboxes.positiveAtmosphere} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="positiveAtmosphere">Positive Vibe</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="cleanSchool" name="cleanSchool" checked={!!formData.environmentCheckboxes.cleanSchool} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="cleanSchool">Clean School</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="unwelcoming" name="unwelcoming" checked={!!formData.environmentCheckboxes.unwelcoming} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="unwelcoming">Unwelcoming</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="poorLeadership" name="poorLeadership" checked={!!formData.environmentCheckboxes.poorLeadership} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="poorLeadership">Poor Leadership</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="unhelpfulSupport" name="unhelpfulSupport" checked={!!formData.environmentCheckboxes.unhelpfulSupport} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="unhelpfulSupport">Unhelpful Staff</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="unfriendlyTeachers" name="unfriendlyTeachers" checked={!!formData.environmentCheckboxes.unfriendlyTeachers} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="unfriendlyTeachers">Unfriendly</label></div>
              <div className="flex items-center"><input type="checkbox" className={formCheckInputClasses} id="negativeAtmosphere" name="negativeAtmosphere" checked={!!formData.environmentCheckboxes.negativeAtmosphere} onChange={handleCheckboxChange} /><label className={formCheckLabelClasses} htmlFor="negativeAtmosphere">Negative Vibe</label></div>
            </div>
            <div className="relative mt-4">
              <textarea className={`${formInputClasses} min-h-[80px] resize-y`} placeholder="Additional comments about the school environment..." name="environmentComments" value={formData.environmentComments} onChange={handleChange}></textarea>
              <TextareaNote />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div className="bg-gray-50 p-4 mb-1  rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaGraduationCap className="mr-2 text-[#4361ee]" /> Grade Level</h3>
              <label htmlFor="gradeLevel" className="font-semibold text-sm text-gray-800 mb-2 block">What Grade level did you Sub?</label>
              <select id="gradeLevel" name="gradeLevel" className={`${formInputClasses} mb-3`} value={formData.gradeLevel} onChange={handleChange} disabled={isLoadingGrades}>
                {isLoadingGrades ? (<option value="">Loading grades...</option>)
                  : (
                    <>
                      <option value="">Select Grade</option>
                      {grades.map(grade => (
                        <option key={grade.id} value={grade.gradeLevel}>
                          {grade.gradeLevel}
                        </option>
                      ))}
                    </>
                  )}
              </select>
              <div className="relative"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="gradeLevelComments" placeholder="Comments about this grade..." value={formData.gradeLevelComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>
            <div className="bg-gray-50 p-4 mb-1 rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaTasks className="mr-2 text-[#4361ee]" /> Job Description Accuracy</h3>
              <label className="font-semibold text-sm text-gray-800 mb-2 block">Was the Job listing as described?</label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="jobDescription" id="jd_yes" value="yes" checked={formData.jobDescription === 'yes'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="jd_yes">Yes</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="jobDescription" id="jd_no" value="no" checked={formData.jobDescription === 'no'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="jd_no">No</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="jobDescription" id="jd_explain" value="explain" checked={formData.jobDescription === 'explain'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="jd_explain">Yes & No, I'll explain</label></div>
              </div>
              <div className="relative mt-3"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="jobDescriptionComments" placeholder="Explain any discrepancies..." value={formData.jobDescriptionComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>
            <div className="bg-gray-50 p-4 mb-1 rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaUsers className="mr-2 text-[#4361ee]" /> Student Impact</h3>
              <label className="font-semibold text-sm text-gray-800 mb-2 block">Did any students make an impact?</label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                <div className="flex items-center"><input className={formCheckInputClasses} type="radio" name="impactMade" id="kidsYes" value="yes" checked={formData.impactMade === 'yes'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="kidsYes">Yes</label></div>
                <div className="flex items-center"><input className={formCheckInputClasses} type="radio" name="impactMade" id="kidsNo" value="no" checked={formData.impactMade === 'no'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="kidsNo">No</label></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="impactCount" className="font-semibold text-sm text-gray-800 mb-2 block">How many?</label>
                  <select id="impactCount" name="impactCount" className={formInputClasses} value={formData.impactCount} onChange={handleChange}><option value="">Select</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4+">4+</option></select>
                </div>
                <div>
                  <label className="font-semibold text-sm text-gray-800 mb-2 block">Impact type:</label>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center"><input className={formCheckInputClasses} type="radio" name="impactType" id="positive" value="positive" checked={formData.impactType === 'positive'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="positive">Positive</label></div>
                    <div className="flex items-center"><input className={formCheckInputClasses} type="radio" name="impactType" id="negative" value="negative" checked={formData.impactType === 'negative'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="negative">Negative</label></div>
                  </div>
                </div>
              </div>
              <div className="relative"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="impactComments" placeholder="Describe the impact..." value={formData.impactComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>

            <div className="bg-gray-50 p-4 mb-1 rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaHandsHelping className="mr-2 text-[#4361ee]" /> Staff Support</h3>
              <label className="font-semibold text-sm text-gray-800 mb-2 block">Were you supported by staff?</label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="staffSupport" id="supportYes" value="yes" checked={formData.staffSupport === 'yes'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="supportYes">Yes</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="staffSupport" id="supportNo" value="no" checked={formData.staffSupport === 'no'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="supportNo">No</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="staffSupport" id="supportExplain" value="explain" checked={formData.staffSupport === 'explain'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="supportExplain">Yes & No, I'll explain</label></div>
              </div>
              <div className="relative mt-3"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="staffSupportComments" placeholder="Describe your experience..." value={formData.staffSupportComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>

            <div className="bg-gray-50 p-4 mb-1  rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaBookOpen className="mr-2 text-[#4361ee]" /> Lesson Plans</h3>
              <label className="font-semibold text-sm text-gray-800 mb-2 block">Were Lesson Plans Provided?</label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="lessonPlans" id="plansYes" value="yes" checked={formData.lessonPlans === 'yes'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="plansYes">Yes</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="lessonPlans" id="plansNo" value="no" checked={formData.lessonPlans === 'no'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="plansNo">No</label></div>
                <div className="flex items-center"><input type="radio" className={formCheckInputClasses} name="lessonPlans" id="plansExplain" value="explain" checked={formData.lessonPlans === 'explain'} onChange={handleChange} /><label className={formCheckLabelClasses} htmlFor="plansExplain">Yes & No, I'll explain</label></div>
              </div>
              <div className="relative mt-3"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="lessonPlansComments" placeholder="Comments about lesson plans..." value={formData.lessonPlansComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>

            <div className="bg-gray-50 p-4 mb-1  rounded-xl border border-gray-200/50 flex flex-col">
              <h3 className="font-semibold text-[#3a0ca3] mb-3 text-lg flex items-center"><FaStar className="mr-2 text-[#4361ee]" /> Overall Rating</h3>
              <label htmlFor="overallRating" className="font-semibold text-sm text-gray-800 mb-2 block">Please Rate This School</label>
              <select id="overallRating" name="overallRating" className={`${formInputClasses} mb-3`} value={formData.overallRating} onChange={handleChange}>
                <option value="">Select Rating</option><option value="1">★☆☆☆☆ - Poor</option><option value="2">★★☆☆☆ - Fair</option><option value="3">★★★☆☆ - Average</option><option value="4">★★★★☆ - Good</option><option value="5">★★★★★ - Excellent</option>
              </select>
              <div className="relative"><textarea className={`${formInputClasses} min-h-[80px] resize-y`} name="finalComments" placeholder="Final comments about your experience..." value={formData.finalComments} onChange={handleChange}></textarea><TextareaNote /></div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 bg-[#4361ee] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:bg-[#3a0ca3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4361ee]/30 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <FaPaperPlane />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;