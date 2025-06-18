// src/components/Home/PreLoginContent.tsx

import React from "react";
import { FaFileAlt, FaSearchLocation, FaUsers, FaLock,  } from "react-icons/fa";

interface PreLoginContentProps {
  scrollToLogin: () => void;
}

const PreLoginContent: React.FC<PreLoginContentProps> = ({ scrollToLogin }) => {
  const featureCardClasses = "bg-white p-8 rounded-2xl shadow-xl border border-transparent hover:border-[#4361ee]/30 flex-1 flex flex-col items-center text-center transform hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out animate-fadeInUp";
  const heroActionButtonClasses = "btn-primary bg-[#4361ee] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#3a0ca3] transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:ring-offset-2";

  return (
    <>
      {/* Section 1: Why Join? */}
      <div className="container text-center mb-16 md:mb-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-[#3a0ca3] animate-fadeIn">
          Unlock Your Ultimate Guide to Schools
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4 animate-fadeIn animate-delay-200">
          Join our community of guest teachers to access exclusive, real-world insights.
        </p>
      </div>

      <div className="container mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {/* Feature Card 1 */}
          <div className={featureCardClasses} style={{ animationDelay: '0.4s' }}>
            <FaFileAlt className="text-5xl text-[#4361ee] mb-5" />
            <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3">Honest, Detailed Reports</h3>
            <p className="text-gray-600 text-base mb-6 flex-grow">
              Read uncensored reviews on staff support, student behavior, lesson plan quality, and more.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className={featureCardClasses} style={{ animationDelay: '0.6s' }}>
            <FaSearchLocation className="text-5xl text-[#4361ee] mb-5" />
            <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3">Find Your Best Fit</h3>
            <p className="text-gray-600 text-base mb-6 flex-grow">
              Search and filter schools by location, grade level, and overall rating to find the perfect assignment.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className={featureCardClasses} style={{ animationDelay: '0.8s' }}>
            <FaUsers className="text-5xl text-[#4361ee] mb-5" />
            <h3 className="text-2xl font-semibold text-[#3a0ca3] mb-3">A Community You Trust</h3>
            <p className="text-gray-600 text-base mb-6 flex-grow">
              All reports are from verified guest teachers, creating a reliable resource for your career.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: How It Works & Final CTA */}
      <section className="bg-white py-16 md:py-20 rounded-t-3xl shadow-inner-top">
        <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3a0ca3] mb-12">Get Started in 3 Simple Steps</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start mb-16 text-center">
                <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-[#4361ee] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">1</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Create a Free Account</h3>
                    <p className="text-gray-600">Quickly sign up with Google or email to join our community.</p>
                </div>
                 <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-[#4361ee] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">2</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Search & Read Reports</h3>
                    <p className="text-gray-600">Instantly access our full database of school and teacher reviews.</p>
                </div>
                 <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                    <div className="bg-[#4361ee] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">3</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Share Your Experience</h3>
                    <p className="text-gray-600">Anonymously submit your own reports to help fellow guest teachers.</p>
                </div>
            </div>
            <button onClick={scrollToLogin} className={`${heroActionButtonClasses} flex items-center justify-center mx-auto text-lg px-10 py-4`}>
              <FaLock className="mr-3" />
              Join for Free & Unlock Access
            </button>
        </div>
      </section>
      
      <style>{`.shadow-inner-top { box-shadow: inset 0 8px 8px -8px rgba(0, 0, 0, 0.1); }`}</style>
    </>
  );
};

export default PreLoginContent;