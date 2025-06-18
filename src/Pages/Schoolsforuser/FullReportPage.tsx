import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../API/apiConfig';
import { 
    FaSchool, FaCalendarAlt, FaStar, FaSpinner, FaExclamationTriangle, FaGraduationCap,
    FaClipboardCheck, FaTasks, FaUsers, FaHandsHelping, FaBookOpen, FaArrowLeft, FaQuoteLeft,
     FaChalkboardTeacher, FaSmile, FaFrown, FaThumbsUp, FaThumbsDown
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Animation hook with improved intersection detection
const useScrollAnimation = (threshold = 0.1) => {
    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, 
            { threshold }
        );
        if (elementRef.current) observer.observe(elementRef.current);
        return () => {
            if (elementRef.current) observer.unobserve(elementRef.current);
        };
    }, []);
    return elementRef;
};

// Interfaces
interface FullReviewDetails {
    id: number; schoolId: number; schoolYear: string; gradeLevel: string;
    overallRating: number; finalComments: string; environmentComments: string;
    welcoming: boolean; friendlyOffice: boolean; helpfulSupport: boolean;
    teacherFriendly: boolean; positiveAtmosphere: boolean; cleanSchool: boolean;
    unwelcoming: boolean; poorLeadership: boolean; unhelpfulSupport: boolean;
    unfriendlyTeachers: boolean; negativeAtmosphere: boolean;
    jobDescription: string; jobDescriptionComments: string;
    impactMade: string; impactCount: string; impactType: string; impactComments: string;
    staffSupport: string; staffSupportComments: string;
    lessonPlans: string; lessonPlansComments: string;
    gradeLevelComments: string;
}

interface SchoolReview {
    schoolName: string; reviewDetails: FullReviewDetails;
}

// Enhanced Components
const SectionWrapper: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    className?: string;
}> = ({ title, icon, children, className = '' }) => {
    const animationRef = useScrollAnimation(0.05);
    return (
        <div 
            ref={animationRef} 
            className={`animate-section mb-8 ${className}`}
        >
            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4 pt-6 border-t border-gray-100">
                <span className="bg-indigo-100 p-2 rounded-lg mr-3 text-indigo-600">
                    {icon}
                </span>
                {title}
            </h3>
            {children}
        </div>
    );
};

const CommentBox: React.FC<{ text: string | null }> = ({ text }) => {
    if (!text) return null;
    return (
        <div className="bg-indigo-50 border-l-4 border-indigo-300 p-4 text-gray-700 mt-3 rounded-r-lg relative">
            <FaQuoteLeft className="text-indigo-200 absolute top-3 left-3 text-2xl" />
            <p className="pl-6 relative z-10">{text}</p>
        </div>
    );
};

const InfoCard: React.FC<{ 
    label: string; 
    value: string; 
    icon: React.ReactNode;
    className?: string;
}> = ({ label, value, icon, className = '' }) => {
    return (
        <div className={`flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
            <span className="bg-indigo-100 p-2 rounded-lg mr-3 text-indigo-600">
                {icon}
            </span>
            <div>
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <p className="text-md font-medium text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const RatingDisplay: React.FC<{ rating: number }> = ({ rating }) => {
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
                if (i < filledStars) {
                    return <FaStar key={i} className="text-yellow-400 text-xl" />;
                } else if (i === filledStars && hasHalfStar) {
                    return (
                        <div key={i} className="relative">
                            <FaStar className="text-gray-300 text-xl" />
                            <FaStar 
                                className="text-yellow-400 text-xl absolute top-0 left-0 w-1/2 overflow-hidden" 
                                style={{ clipPath: 'inset(0 50% 0 0)' }}
                            />
                        </div>
                    );
                } else {
                    return <FaStar key={i} className="text-gray-300 text-xl" />;
                }
            })}
            <span className="ml-2 font-bold">{rating.toFixed(1)}</span>
        </div>
    );
};

const Tag: React.FC<{ 
    type: 'positive' | 'negative'; 
    text: string; 
}> = ({ type, text }) => {
    const baseClasses = "text-xs font-medium mr-2 mb-2 px-3 py-1.5 rounded-full inline-flex items-center transition-all";
    const typeClasses = type === 'positive' 
        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" 
        : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100";
    const icon = type === 'positive' 
        ? <FaThumbsUp className="mr-1.5" /> 
        : <FaThumbsDown className="mr-1.5" />;
    return (
        <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`${baseClasses} ${typeClasses}`}
        >
            {icon}{text}
        </motion.span>
    );
    
};

// Main Display Component
const ReviewDetailDisplay: React.FC<{ review: SchoolReview }> = ({ review }) => {
    const details = review.reviewDetails;
    const containerRef = useRef<HTMLDivElement>(null);
    
    const getEnvTags = (positive: boolean) => {
        const positiveKeys = ['welcoming', 'friendlyOffice', 'helpfulSupport', 'teacherFriendly', 'positiveAtmosphere', 'cleanSchool'];
        const negativeKeys = ['unwelcoming', 'poorLeadership', 'unhelpfulSupport', 'unfriendlyTeachers', 'negativeAtmosphere'];
        
        return Object.entries(details)
            .filter(([key, value]) => value === true && (positive ? positiveKeys.includes(key) : negativeKeys.includes(key)))
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()));
    };

    const positiveEnv = getEnvTags(true);
    const negativeEnv = getEnvTags(false);

    return (
        <div ref={containerRef} className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            {/* Header Section */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Experience Report
                    </span>
                </h1>
                <p className="text-gray-500 text-lg">
                    Detailed review of teaching at <span className="font-semibold text-indigo-700">{review.schoolName}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Environment Section */}
                    <SectionWrapper 
                        title="School Environment" 
                        icon={<FaClipboardCheck />}
                    >
                        <div className="mb-4">
                            {positiveEnv.length > 0 && (
                                <div className="mb-3">
                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                                        <FaSmile className="text-green-500 mr-2" />
                                        Positive Aspects
                                    </h4>
                                    {positiveEnv.map(tag => (
                                        <Tag key={tag} type="positive" text={tag} />
                                    ))}
                                </div>
                            )}
                            {negativeEnv.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                                        <FaFrown className="text-red-500 mr-2" />
                                        Negative Aspects
                                    </h4>
                                    {negativeEnv.map(tag => (
                                        <Tag key={tag} type="negative" text={tag} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <CommentBox text={details.environmentComments} />
                    </SectionWrapper>

                    {/* Grade Level Experience */}
                    <SectionWrapper 
                        title="Grade Level Experience" 
                        icon={<FaGraduationCap />}
                    >
                        <CommentBox text={details.gradeLevelComments} />
                    </SectionWrapper>

                    {/* Job Description */}
                    <SectionWrapper 
                        title="Job Description Accuracy" 
                        icon={<FaTasks />}
                    >
                        <div className="mb-3">
                            <p className="font-semibold text-gray-700 mb-1">Was the job listing as described?</p>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    details.jobDescription === 'yes' 
                                        ? 'bg-green-100 text-green-800' 
                                        : details.jobDescription === 'no' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {details.jobDescription === 'explain' ? 'Mixed' : details.jobDescription}
                                </span>
                            </div>
                        </div>
                        <CommentBox text={details.jobDescriptionComments} />
                    </SectionWrapper>

                    {/* Student Impact */}
                    <SectionWrapper 
                        title="Student Impact" 
                        icon={<FaUsers />}
                    >
                        <div className="mb-3">
                            <p className="font-semibold text-gray-700 mb-1">Did any students make an impact?</p>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    details.impactMade === 'yes' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {details.impactMade}
                                </span>
                            </div>
                            {details.impactMade === 'yes' && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Count:</span> {details.impactCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Type:</span> {details.impactType}
                                    </p>
                                </div>
                            )}
                        </div>
                        <CommentBox text={details.impactComments} />
                    </SectionWrapper>

                    {/* Staff Support */}
                    <SectionWrapper 
                        title="Staff Support" 
                        icon={<FaHandsHelping />}
                    >
                        <div className="mb-3">
                            <p className="font-semibold text-gray-700 mb-1">Were you supported by staff?</p>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    details.staffSupport === 'yes' 
                                        ? 'bg-green-100 text-green-800' 
                                        : details.staffSupport === 'no' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {details.staffSupport === 'explain' ? 'Mixed' : details.staffSupport}
                                </span>
                            </div>
                        </div>
                        <CommentBox text={details.staffSupportComments} />
                    </SectionWrapper>

                    {/* Lesson Plans */}
                    <SectionWrapper 
                        title="Lesson Plans" 
                        icon={<FaBookOpen />}
                    >
                        <div className="mb-3">
                            <p className="font-semibold text-gray-700 mb-1">Were lesson plans provided?</p>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    details.lessonPlans === 'yes' 
                                        ? 'bg-green-100 text-green-800' 
                                        : details.lessonPlans === 'no' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {details.lessonPlans === 'explain' ? 'Mixed' : details.lessonPlans}
                                </span>
                            </div>
                        </div>
                        <CommentBox text={details.lessonPlansComments} />
                    </SectionWrapper>

                    {/* Final Summary */}
                    <SectionWrapper 
                        title="Final Summary" 
                        icon={<FaChalkboardTeacher />}
                    >
                        <CommentBox text={details.finalComments} />
                    </SectionWrapper>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-6 bg-gradient-to-b from-indigo-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4 flex items-center">
                            <FaClipboardCheck className="mr-2 text-indigo-600" />
                            Review Summary
                        </h3>
                        
                        {/* Overall Rating */}
                        <div className="text-center mb-6 p-4 bg-white rounded-lg shadow-inner border border-gray-100">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Overall Rating</p>
                            <div className="flex items-center justify-center">
                                <RatingDisplay rating={details.overallRating} />
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                {details.overallRating >= 4 ? 'Very Positive' : 
                                 details.overallRating >= 3 ? 'Generally Positive' : 
                                 details.overallRating >= 2 ? 'Mixed' : 'Negative'} Experience
                            </div>
                        </div>
                        
                        {/* Key Info */}
                        <div className="space-y-3">
                            <InfoCard 
                                label="School" 
                                value={review.schoolName} 
                                icon={<FaSchool />}
                                className="bg-white shadow-sm"
                            />
                            <InfoCard 
                                label="School Year" 
                                value={details.schoolYear} 
                                icon={<FaCalendarAlt />}
                                className="bg-white shadow-sm"
                            />
                            <InfoCard 
                                label="Grade Level" 
                                value={details.gradeLevel} 
                                icon={<FaGraduationCap />}
                                className="bg-white shadow-sm"
                            />
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-500 mb-3">Experience Highlights</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-center">
                                    <div className="text-indigo-600 text-xl mb-1">
                                        {positiveEnv.length}
                                    </div>
                                    <div className="text-xs text-gray-500">Positive Aspects</div>
                                </div>
                                <div className="bg-white p-2 rounded-lg shadow-sm text-center">
                                    <div className="text-red-600 text-xl mb-1">
                                        {negativeEnv.length}
                                    </div>
                                    <div className="text-xs text-gray-500">Negative Aspects</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// Main Page Component
const FullReportPage = () => {
    const { reviewId } = useParams<{ reviewId: string }>();
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState<SchoolReview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!reviewId) { navigate('/browse-schools'); return; }
        const fetchReviewDetails = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get<SchoolReview>(`${API_ENDPOINTS.GetReviewsById}/${reviewId}`);
                setReviewData(response.data);
            } catch (err) {
                setError("Could not load the review. It may have been deleted or is no longer available.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviewDetails();
    }, [reviewId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700">Loading Full Report</h2>
                    <p className="text-gray-500 mt-2">Gathering all the details...</p>
                </div>
            </div>
        );
    }

    if (error || !reviewData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-md text-center">
                    <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-800">Report Not Found</h2>
                    <p className="mt-3 text-red-600">{error}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Global Styles */}
            <style>{`
                .animate-section {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                .animate-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
            
            <div className="container mx-auto px-4 py-8 md:py-12">
                <button 
                    onClick={() => navigate(`/schools/${reviewData.reviewDetails.schoolId}`)}
                    className="mb-6 inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group"
                >
                    <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to All Reviews for {reviewData.schoolName}
                </button>
                
                <ReviewDetailDisplay review={reviewData} />
                
                <div className="mt-12 text-center">
                    <p className="text-gray-500">
                        This report was submitted by a guest teacher and reflects their personal experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FullReportPage;