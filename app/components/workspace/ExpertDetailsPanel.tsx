"use client";

import React, { useState } from "react";
import { ProposedExpert } from "../../lib/mockData";
import { Star, X, Minus } from "lucide-react";

interface ExpertDetailsProps {
  selectedExpert?: ProposedExpert | null;
  expert?: {
    name: string;
    affiliation: string;
    rating: number;
    about: string;
    workHistory: string;
    skills: string[];
    screeningResponses: {
      question: string;
      answer: string;
    }[];
  };
}

export default function ExpertDetailsPanel({ selectedExpert, expert }: ExpertDetailsProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratings, setRatings] = useState({
    relevance: 0,
    expertise: 0,
    communication: 0
  });
  const [reviewText, setReviewText] = useState("");
  const [sameInternalPublic, setSameInternalPublic] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  // Default expert data (John Doe from the image)
  const defaultExpert = {
    name: "John Doe",
    affiliation: "GLG",
    rating: 5,
    about: "John Doe is an expert in renewable energy solutions with over 15 years of experience. He has led numerous projects focusing on sustainable practices and innovative technologies. With a Master's degree in Environmental Science and published papers on renewable resources, he provides valuable insights for investors and strategic thinking with clear communication skills.",
    workHistory: "John Doe is an expert in renewable energy solutions with over 15 years of experience. He has led numerous projects focusing on sustainable practices and innovative technologies. With a Master's degree in Environmental Science and published papers on renewable resources, he provides valuable insights for investors and strategic thinking with clear communication skills.",
    skills: [
      "Solar Energy Systems",
      "Wind Turbine Technology", 
      "Energy Storage Solutions",
      "Energy Efficiency Audits",
      "Solar Battery Systems",
      "Lithium-ion Technologies",
      "Hydrogen Fuel Cells",
      "+20 more"
    ],
    screeningResponses: [
      {
        question: "What criteria do you consider most important when evaluating the effectiveness of a new software tool in your field?",
        answer: "1. Usability: How intuitive and user-friendly is the interface? Can users easily navigate the tool without extensive training?\n\n2. Functionality: Does the software meet the specific needs of my work? Are the features robust enough to handle the tasks I need to perform?\n\n3. Integration: How well does the tool integrate with existing systems and workflows? Seamless integration can significantly enhance productivity."
      },
      {
        question: "How do you determine if a new software tool is truly beneficial for your work?",
        answer: "1. Usability: How intuitive and user-friendly is the interface? Can users easily navigate the tool without extensive training?\n\n2. Functionality: Does the software meet the specific needs of my work? Are the features robust enough to handle the tasks I need to perform?\n\n3. Integration: How well does the tool integrate with existing systems and workflows? Seamless integration can significantly enhance productivity."
      }
    ]
  };

  // Convert selectedExpert to the expected format or use default
  const getExpertData = () => {
    if (selectedExpert) {
      return {
        name: selectedExpert.name,
        affiliation: selectedExpert.company,
        rating: selectedExpert.rating,
        about: selectedExpert.description,
        workHistory: selectedExpert.history,
        skills: selectedExpert.skills,
        screeningResponses: selectedExpert.screeningResponses
      };
    }
    return expert || defaultExpert;
  };

  const expertData = getExpertData();

  const handleRatingChange = (category: keyof typeof ratings, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handlePostRating = () => {
    // Handle posting the rating
    console.log("Posting rating:", { ratings, reviewText, sameInternalPublic });
    setShowReviewModal(false);
    // Reset form
    setRatings({ relevance: 0, expertise: 0, communication: 0 });
    setReviewText("");
  };

  const renderStars = (category: keyof typeof ratings, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(category, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= currentRating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderProgressBar = (category: string, rating: number) => {
    const percentage = (rating / 5) * 100;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-dark-text-secondary w-32">{category}</span>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text w-10 text-center">{rating}</span>
      </div>
    );
  };

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Expert Details
        </h3>
        {/* {selectedExpert && (
          <button 
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-5 text-white text-sm font-medium rounded-md transition-colors h-6 flex items-center justify-center bg-primary-500 hover:bg-primary-600"
          >
            {selectedExpert.status === "Awaiting Review" ? "Review" : "View Review"}
          </button>
        )} */}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          {/* About Section */}
          <div>
            <h5 className="font-semibold text-light-text dark:text-dark-text mb-3">About</h5>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {expertData.about}
            </p>
          </div>

          {/* Work History Section */}
          <div>
            <h5 className="font-semibold text-light-text dark:text-dark-text mb-3">Work History</h5>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {expertData.workHistory}
            </p>
          </div>

          {/* Skills Section */}
          <div>
            <h5 className="font-semibold text-light-text dark:text-dark-text mb-3">Skills</h5>
            <div className="flex flex-wrap gap-2">
              {expertData.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    skill === "+20 more"
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Screening Response Section */}
          <div>
            <h5 className="font-semibold text-light-text dark:text-dark-text mb-3">Screening response</h5>
            <div className="space-y-4">
              {expertData.screeningResponses.map((response, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h6 className="font-medium text-light-text dark:text-dark-text mb-3">
                    {response.question}
                  </h6>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed whitespace-pre-line">
                    {response.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedExpert && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-primary-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={() => setShowReviewModal(false)}
                className="float-right text-gray-400 hover:text-gray-600 dark:text-dark-text-secondary dark:hover:text-dark-text"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Expert Information */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img 
                    src={selectedExpert.avatar} 
                    alt={selectedExpert.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{selectedExpert.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{selectedExpert.title}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">{selectedExpert.company}</p>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Relevance</span>
                  {renderStars("relevance", ratings.relevance)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Expertise</span>
                  {renderStars("expertise", ratings.expertise)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Communication</span>
                  {renderStars("communication", ratings.communication)}
                </div>
              </div>

              {/* Review Text Area */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Review</h4>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write Review (optional)..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-dark-background text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-text-tertiary"
                />
              </div>

              {/* Post Rating Button */}
              <button
                onClick={handlePostRating}
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-3 rounded-md transition-colors"
              >
                Post Rating
              </button>

              {/* Overall Rating and Reviews Section */}
              {showReviews && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Overall Rating and Reviews</h4>
                  
                  {/* Overall Score */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-dark-text">4.7</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= 4
                              ? "text-yellow-400 fill-current"
                              : star === 5
                              ? "text-yellow-400 fill-current opacity-70"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Based on 565 ratings</span>
                  </div>

                  {/* Category Ratings */}
                  <div className="space-y-3">
                    {renderProgressBar("Relevance", 4.9)}
                    {renderProgressBar("Expertise", 4.5)}
                    {renderProgressBar("Communication", 4.3)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
