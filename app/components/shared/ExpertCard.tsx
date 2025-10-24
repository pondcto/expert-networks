"use client";
import React from "react";
import { Expert } from "../../types";

interface ExpertCardProps {
  expert: Expert;
  showBadge?: boolean;
  onAction?: () => void;
  actionText?: string;
  actionIcon?: React.ReactNode;
  vendorLogoUrl?: string; // optional small vendor avatar overlay
}

export default function ExpertCard({ 
  expert, 
  onAction, 
  actionText = "View",
  actionIcon,
  vendorLogoUrl
}: ExpertCardProps) {
  return (
    <div className="flex items-center w-full gap-4 p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
      {/* Avatars and Badge */}
      <div className="flex items-center gap-3">
        {vendorLogoUrl && (
          <div className="w-10 h-10 rounded border-2 rounded border-solid border-primary-200 overflow-hidden bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center">
            <img src={vendorLogoUrl} alt="Vendor" className="w-full h-full object-contain" />
          </div>
        )}
        <div className="relative border-2 rounded border-solid border-primary-200">
          <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img 
              src={expert.avatar} 
              alt={expert.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Expert Info */}
      <div className="flex-1">
        <div className="font-medium text-light-text dark:text-dark-text">
          {expert.name}
        </div>
        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          {expert.title}
        </div>
      </div>
      
      {/* Action Button */}
      {onAction && (
        <button 
          onClick={onAction}
          className="px-3 py-1.5 text-sm bg-light-500 dark:bg-light-800 text-light-text dark:text-dark-text rounded-md border border-primary-500 dark:border-primary-700 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-700 transition-colors flex items-center gap-1"
        >
          {actionText}
          {actionIcon}
        </button>
      )}
    </div>
  );
}
