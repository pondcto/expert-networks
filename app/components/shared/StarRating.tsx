"use client";
import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  interactive = false,
  onRatingChange 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  if (rating === null) {
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-500">
        <Star className={`${sizeClasses[size]} fill-current`} />
        <span className="text-sm">Rate and review</span>
      </div>
    );
  }

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    
    // Full star
    if (starNumber <= fullStars) {
      return (
        <Star 
          key={index} 
          className={`${sizeClasses[size]} text-orange-500 fill-orange-500 ${
            interactive ? 'cursor-pointer hover:text-orange-400' : ''
          }`}
          onClick={() => handleClick(starNumber)}
        />
      );
    }
    
    // Partial star
    if (starNumber === fullStars + 1 && decimal > 0) {
      return (
        <div key={index} className="relative inline-block">
          {/* Background empty star */}
          <Star 
            className={`${sizeClasses[size]} text-gray-300 fill-gray-300 ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleClick(starNumber)}
          />
          {/* Foreground partial star */}
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${decimal * 100}%` }}
          >
            <Star 
              className={`${sizeClasses[size]} text-orange-500 fill-orange-500`}
            />
          </div>
        </div>
      );
    }
    
    // Empty star
    return (
      <Star 
        key={index} 
        className={`${sizeClasses[size]} text-gray-300 fill-gray-300 ${
          interactive ? 'cursor-pointer hover:text-orange-400' : ''
        }`}
        onClick={() => handleClick(starNumber)}
      />
    );
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
    </div>
  );
}
