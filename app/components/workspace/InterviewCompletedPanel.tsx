"use client";
import React, { useState } from "react";
import { ChevronRight, ArrowUpDown, Download, Star, X } from "lucide-react";
import { CompletedInterview } from "../../types";
import { mockCompletedInterviews } from "../../data/mockData";
import StarRating from "../shared/StarRating";
import ToggleSwitch from "../shared/ToggleSwitch";

type SortColumn = "name" | "time" | "rating" | "duration";
type SortDirection = "asc" | "desc";

export default function InterviewCompletedPanel() {
    const [sortColumn, setSortColumn] = useState<SortColumn>("time");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<CompletedInterview | null>(null);
    const [ratings, setRatings] = useState({
        relevance: 0,
        expertise: 0,
        communication: 0
    });
    const [reviewText, setReviewText] = useState("");
    const [showReviews, setShowReviews] = useState(false);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleOpenReviewModal = (interview: CompletedInterview) => {
        setSelectedInterview(interview);
        setShowReviewModal(true);
        setRatings({ relevance: 0, expertise: 0, communication: 0 });
        setReviewText("");
        setShowReviews(false);
    };

    const handleRatingClick = (category: "relevance" | "expertise" | "communication", rating: number) => {
        setRatings(prev => ({ ...prev, [category]: rating }));
    };

    const renderStars = (category: "relevance" | "expertise" | "communication", currentRating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer ${
                            star <= currentRating
                                ? "text-orange-500 fill-orange-500"
                                : "text-gray-300 dark:text-gray-600"
                        } hover:text-orange-400`}
                        onClick={() => handleRatingClick(category, star)}
                    />
                ))}
            </div>
        );
    };

    const renderProgressBar = (label: string, rating: number) => {
        const percentage = (rating / 5) * 100;
        return (
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-text w-32">{label}</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-text w-8">{rating}</span>
            </div>
        );
    };

    const handlePostRating = () => {
        console.log("Posted rating:", ratings, reviewText);
        setShowReviews(true);
        setShowReviewModal(false);
    };

    const parseDuration = (duration: string): number => {
        if (duration.includes("hour")) {
            const hours = parseFloat(duration);
            return hours * 60;
        } else if (duration.includes("min")) {
            return parseFloat(duration);
        }
        return 0;
    };

    const parseDateTime = (date: string, time: string): Date => {
        const dateStr = `${date} ${time.split(" - ")[0]}`;
        return new Date(dateStr);
    };

    const getSortedInterviews = () => {
        const sorted = [...mockCompletedInterviews].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case "name":
                    comparison = a.expertName.localeCompare(b.expertName);
                    break;
                case "time":
                    const dateA = parseDateTime(a.interviewDate, a.interviewTime);
                    const dateB = parseDateTime(b.interviewDate, b.interviewTime);
                    comparison = dateA.getTime() - dateB.getTime();
                    break;
                case "rating":
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    comparison = ratingA - ratingB;
                    break;
                case "duration":
                    comparison = parseDuration(a.duration) - parseDuration(b.duration);
                    break;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });

        return sorted;
    };

    return (    
        <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                        Completed Interviews
                    </h3>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border z-10">
                        <tr>
                            <th 
                                className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center gap-2">
                                    Name
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th 
                                className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => handleSort("time")}
                            >
                                <div className="flex items-center gap-2">
                                    Time
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th 
                                className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => handleSort("duration")}
                            >
                                <div className="flex items-center gap-2">
                                    Duration
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th 
                                className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => handleSort("rating")}
                            >
                                <div className="flex items-center gap-2">
                                    Rating
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                Transcript
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                Actions
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                Chat
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getSortedInterviews().map((interview) => (
                            <tr key={interview.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                {/* Expert Profile Column */}
                                <td className="p-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                            <img 
                                                src={interview.avatar} 
                                                alt={interview.expertName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-light-text dark:text-dark-text truncate">
                                                {interview.expertName}
                                            </div>
                                            <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                                                {interview.expertTitle}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Interview Time Column */}
                                <td className="p-1">
                                    <div className="text-sm text-light-text dark:text-dark-text">
                                        {interview.interviewDate}
                                    </div>
                                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                        {interview.interviewTime}
                                    </div>
                                </td>

                                {/* Duration Column */}
                                <td className="p-1">
                                    <div className="text-sm text-light-text dark:text-dark-text">
                                        {interview.duration}
                                    </div>
                                </td>

                                {/* Rating Column */}
                                <td className="p-3">
                                    {interview.rating === null ? (
                                        <button
                                            onClick={() => handleOpenReviewModal(interview)}
                                            className="flex items-center gap-1 text-sm rounded-md transition-colors"
                                        >
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Rate & Review</span>
                                        </button>
                                    ) : (
                                        <StarRating rating={interview.rating} />
                                    )}
                                </td>

                                {/* Transcript Column */}
                                <td className="p-1">
                                    {interview.transcriptAvailable ? (
                                        <button 
                                            onClick={() => console.log(`Download transcript for ${interview.expertName}`)}
                                            className="flex items-center justify-center gap-1 w-32 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                    ) : (
                                        <button 
                                            disabled
                                            className="flex items-center justify-center w-32 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md cursor-not-allowed"
                                        >
                                            Pending
                                        </button>
                                    )}
                                </td>

                                {/* Actions Column */}
                                <td className="p-1">
                                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-light-500 dark:bg-light-800 text-light-text dark:text-dark-text rounded-md border border-light-border dark:border-dark-border hover:bg-primary-500 hover:text-white dark:hover:bg-primary-700 transition-colors">
                                        <span>View details</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </td>

                                {/* Chat Toggle Column */}
                                <td className="p-1">
                                    <ToggleSwitch 
                                        isActive={interview.isActive}
                                        onChange={(isActive) => {
                                            console.log(`Interview ${interview.id} is now ${isActive ? 'active' : 'inactive'}`);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedInterview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
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
                                        src={selectedInterview.avatar} 
                                        alt={selectedInterview.expertName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{selectedInterview.expertName}</h3>
                                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{selectedInterview.expertTitle}</p>
                                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">{selectedInterview.interviewDate} - {selectedInterview.interviewTime}</p>
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
                                                            ? "text-orange-500 fill-orange-500"
                                                            : star === 5
                                                            ? "text-orange-500 fill-orange-500 opacity-70"
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