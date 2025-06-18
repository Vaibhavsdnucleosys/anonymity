import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../API/apiConfig';
import {
    FaSchool, FaStar, FaSpinner, FaExclamationTriangle,
    FaCalendarAlt, FaChevronLeft, FaChevronRight,
    FaThumbsUp, FaThumbsDown, FaRegSadTear, FaQuoteLeft, FaCheckCircle, FaTimesCircle, FaChalkboardTeacher, FaSearch,
    FaGraduationCap
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces (Unchanged) ---
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

// --- Component to Highlight Matched Text ---
const HighlightText: React.FC<{ text: string | null | undefined; highlight: string }> = ({ text, highlight }) => {
    if (!highlight || !text) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <mark key={index} className="bg-yellow-200 text-black px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                )
            )}
        </span>
    );
};

// --- Sub-Components ---
const EnvTag: React.FC<{ type: 'positive' | 'negative'; text: string }> = ({ type, text }) => {
    const baseClasses = "text-[11px] font-medium mr-1.5 mb-1.5 px-2 py-1 rounded-full inline-flex items-center";
    const typeClasses = type === 'positive' ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-800";
    const icon = type === 'positive' ? <FaThumbsUp className="mr-1" /> : <FaThumbsDown className="mr-1" />;
    return <span className={`${baseClasses} ${typeClasses}`}>{icon}{text}</span>;
}

const DetailRow: React.FC<{ label: string; answer: React.ReactNode; comment?: React.ReactNode }> = ({ label, answer, comment }) => (
    <tr className="border-b border-gray-100 last:border-none">
        <td className="py-2.5 pr-2 text-sm font-medium text-gray-600 align-top w-1/3">{label}</td>
        <td className="py-2.5 text-center font-bold text-sm align-top w-1/4">{answer}</td>
        <td className="py-2.5 pl-2 text-xs italic text-gray-500 align-top">{comment}</td>
    </tr>
);

const AnswerBadge: React.FC<{ value: string }> = ({ value }) => {
    let icon, color;
    switch (value) {
        case 'yes': icon = <FaCheckCircle />; color = 'text-teal-600'; break;
        case 'no': icon = <FaTimesCircle />; color = 'text-red-600'; break;
        default: icon = <FaStar className="text-xs" />; color = 'text-yellow-600'; break;
    }
    return (
        <div className={`flex items-center justify-center font-bold text-sm ${color}`}>
            {icon}
            <span className="ml-1.5">{value === 'explain' ? 'Mixed' : value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </div>
    );
};

// --- Star Rating Component for the Header ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    const emptyStars = totalStars - filledStars;

    return (
        <div className="flex items-center text-yellow-400">
            {[...Array(filledStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
            {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300" />)}
        </div>
    );
};


// --- MODERN REVIEW CARD ---
const ModernReviewCard: React.FC<{ reviewItem: SchoolReview; index: number; searchTerm: string; }> = ({ reviewItem, index, searchTerm }) => {
    const reviewDetails = reviewItem.reviewDetails;

    const getEnvTags = (positive: boolean) => {
        const tags: string[] = [];
        if (positive) {
            if (reviewDetails.welcoming) tags.push('Welcoming');
            if (reviewDetails.friendlyOffice) tags.push('Friendly Office');
            if (reviewDetails.helpfulSupport) tags.push('Helpful Support');
            if (reviewDetails.teacherFriendly) tags.push('Teacher-Friendly');
            if (reviewDetails.positiveAtmosphere) tags.push('Positive Atmosphere');
            if (reviewDetails.cleanSchool) tags.push('Clean School');
        } else {
            if (reviewDetails.unwelcoming) tags.push('Unwelcoming');
            if (reviewDetails.poorLeadership) tags.push('Poor Leadership');
            if (reviewDetails.unhelpfulSupport) tags.push('Unhelpful Support');
            if (reviewDetails.unfriendlyTeachers) tags.push('Unfriendly Teachers');
            if (reviewDetails.negativeAtmosphere) tags.push('Negative Atmosphere');
        }
        return tags;
    };
    const positiveEnv = getEnvTags(true);
    const negativeEnv = getEnvTags(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg text-indigo-700"><HighlightText text={reviewDetails.gradeLevel} highlight={searchTerm} /></p>
                    <p className="text-xs text-gray-500 flex items-center mt-0.5"><FaCalendarAlt className="mr-1.5" /><HighlightText text={reviewDetails.schoolYear} highlight={searchTerm} /></p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center">{[...Array(5)].map((_, i) => <FaStar key={i} className={`text-lg ${i < Math.round(reviewDetails.overallRating) ? 'text-yellow-400' : 'text-gray-300'}`} />)}</div>
                    <p className="font-bold text-indigo-800 text-lg mt-0.5">{reviewDetails.overallRating.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ 5.0</span></p>
                </div>
            </div>

            <div className="p-4 space-y-5">
                <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Environment</h4>
                    <div className="flex flex-wrap">{positiveEnv.map(tag => <EnvTag key={tag} type="positive" text={tag} />)}{negativeEnv.map(tag => <EnvTag key={tag} type="negative" text={tag} />)}</div>
                    {reviewDetails.environmentComments && <p className="text-xs italic text-gray-500 mt-2">"<HighlightText text={reviewDetails.environmentComments} highlight={searchTerm} />"</p>}
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Details</h4>
                    <table className="w-full text-left">
                        <tbody>
                            <DetailRow label="Job As Described" answer={<AnswerBadge value={reviewDetails.jobDescription} />} comment={<HighlightText text={reviewDetails.jobDescriptionComments} highlight={searchTerm} />} />
                            <DetailRow label="Staff Support" answer={<AnswerBadge value={reviewDetails.staffSupport} />} comment={<HighlightText text={reviewDetails.staffSupportComments} highlight={searchTerm} />} />
                            <DetailRow label="Lesson Plans Provided" answer={<AnswerBadge value={reviewDetails.lessonPlans} />} comment={<HighlightText text={reviewDetails.lessonPlansComments} highlight={searchTerm} />} />
                            <DetailRow
                                label="Student Impact"
                                answer={<div className="flex flex-col items-center"><AnswerBadge value={reviewDetails.impactMade} />{reviewDetails.impactMade === 'yes' && (<div className="mt-1.5 text-xs text-gray-500 text-center"><span>{reviewDetails.impactCount}, </span><span>{reviewDetails.impactType}</span></div>)}</div>}
                                comment={<HighlightText text={reviewDetails.impactComments} highlight={searchTerm} />}
                            />
                        </tbody>
                    </table>
                </div>

                {reviewDetails.gradeLevelComments && (
                    <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center"><FaGraduationCap className="mr-2" />Grade Level Specific Comments</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm italic relative"><FaQuoteLeft className="absolute top-2 left-2 text-gray-200 text-xl" /><p className="relative pl-4"><HighlightText text={reviewDetails.gradeLevelComments} highlight={searchTerm} /></p></div>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center"><FaChalkboardTeacher className="mr-2" />Final Summary</h4>
                    <div className="bg-indigo-50 p-3 rounded-lg text-gray-700 text-sm italic relative"><FaQuoteLeft className="absolute top-2 left-2 text-indigo-100 text-xl" /><p className="relative pl-4"><HighlightText text={reviewDetails.finalComments || "No final comments."} highlight={searchTerm} /></p></div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main School Details Page Component ---
const SchoolDetails = () => {
    const { schoolId } = useParams<{ schoolId: string }>();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<SchoolReview[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<{ schoolName: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const REVIEWS_PER_PAGE = 3;

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!schoolId) { navigate('/browse-schools'); return; }
        const fetchSchoolReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<SchoolReview[]>(`${API_ENDPOINTS.GetReviewsBySchool}/${schoolId}`);
                if (response.data && response.data.length > 0) {
                    setReviews(response.data);
                    setSchoolInfo({ schoolName: response.data[0].schoolName });
                } else {
                    try {
                        const schoolInfoResponse = await axios.get<any>(`${API_ENDPOINTS.GetSchoolDetails}/${schoolId}`);
                        setSchoolInfo({ schoolName: schoolInfoResponse.data.schoolName });
                        setReviews([]);
                    } catch { throw new Error("School not found."); }
                }
            } catch (err) {
                setError("Could not load school details.");
                toast.error("Failed to load school details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSchoolReviews();
    }, [schoolId, navigate]);

    const filteredReviews = reviews.filter(reviewItem => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const { reviewDetails } = reviewItem;
        const searchableContent = [
            reviewDetails.gradeLevel, reviewDetails.schoolYear,
            reviewDetails.finalComments, reviewDetails.environmentComments,
            reviewDetails.jobDescriptionComments, reviewDetails.impactComments,
            reviewDetails.staffSupportComments, reviewDetails.lessonPlansComments,
            reviewDetails.gradeLevelComments
        ].join(' ').toLowerCase();
        return searchableContent.includes(term);
    });

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    const currentReviews = filteredReviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);
    const overallAverage = reviews.length > 0 ? reviews.reduce((acc, current) => acc + current.reviewDetails.overallRating, 0) / reviews.length : 0;

    if (isLoading) { return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="animate-spin text-3xl text-indigo-500" /></div>; }
    if (error || !schoolInfo) { return <div className="min-h-screen flex items-center justify-center p-4 text-center bg-gray-50"><div className="bg-white p-6 rounded-lg shadow-md"><FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-3" /><h2 className="text-lg font-bold text-red-700">Error</h2><p className="text-red-600 mt-1 text-sm">{error}</p></div></div>; }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-indigo-500">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Left Side: School Name */}
                            <div className="flex-1 min-w-[250px]">
                                {/* <h1 className="text-base font-bold text-gray-800 flex items-center"> */}
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                                    <FaSchool className="text-indigo-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{schoolInfo.schoolName}</span>
                               </h4>


                            </div>


                            {/* Center: Avg Rating */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-600">Avg Rating: {reviews.length > 0 ? overallAverage.toFixed(1) : 'N/A'}</span>
                                {reviews.length > 0 && <StarRating rating={overallAverage} />}
                            </div>

                            {/* Right Side: Search */}
                            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search reviews..."
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main>
                    {reviews.length > 0 ? (
                        filteredReviews.length > 0 ? (
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {currentReviews.map((reviewItem, index) => <ModernReviewCard key={reviewItem.reviewDetails.id} reviewItem={reviewItem} index={index} searchTerm={searchTerm} />)}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                                <FaSearch className="text-4xl text-gray-400 mb-3 mx-auto" />
                                <h3 className="text-xl font-semibold text-gray-700">No Matching Reviews</h3>
                                <p className="mt-2 text-sm text-gray-500">Your filter "{searchTerm}" did not match any reviews.</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <FaRegSadTear className="text-4xl text-indigo-400 mb-3 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-700">No Reviews Yet</h3>
                            <p className="mt-2 text-sm text-gray-500">Be the first to share your experience!</p>
                            <button onClick={() => navigate(`/write-review?schoolId=${schoolId}`)} className="mt-5 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 text-sm shadow-md">Submit a Review</button>
                        </div>
                    )}

                    {filteredReviews.length > REVIEWS_PER_PAGE && (
                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className={`flex items-center bg-white border font-semibold py-1.5 px-3 rounded-md text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}><FaChevronLeft className="mr-1.5" /> Prev</button>
                            <div className="text-gray-600 text-sm">Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span></div>
                            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} className={`flex items-center bg-white border font-semibold py-1.5 px-3 rounded-md text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>Next <FaChevronRight className="ml-1.5" /></button>
                        </div>
                    )}
                </main>

                {/* --- RESTORED: Call to Action Section at the bottom --- */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="bg-indigo-400 rounded-2xl p-8 text-center text-white shadow-xl mt-16"
                >
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Have experience with this school?</h3>
                    <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                        Your insights help other guest teachers make informed decisions about where to work.
                    </p>
                    <motion.button
                        onClick={() => navigate(`/write-review?schoolId=${schoolId}`)}
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg shadow-lg transition-all"
                    >
                        Share Your Experience
                    </motion.button>
                </motion.section>
            </div>
        </div>
    );
};

export default SchoolDetails;