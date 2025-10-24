"use client";

import React, { useState, useEffect } from "react";
import { useCampaign } from "../../lib/campaign-context";
import { Calendar } from "lucide-react";

export interface ScopeRefinementPanelProps {
  onSubmit?: (data: ScopeData) => void;
  onFormChange?: (isCompleted: boolean) => void;
  onDataChange?: (data: ScopeData) => void;
}

export interface ScopeData {
  targetRegions: string[];
  startDate: string;
  targetCompletionDate: string;
  estimatedCalls: number;
}

const targetRegions = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa"
];

// Helper to format date for display
const formatDateForDisplay = (dateString: string) => {
  if (!dateString || dateString === "Any") return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function ScopeRefinementPanel({
  onSubmit,
  onFormChange,
  onDataChange,
}: ScopeRefinementPanelProps) {
  const { campaignData } = useCampaign();
  const [formData, setFormData] = useState<ScopeData>({
    targetRegions: [],
    startDate: "Any",
    targetCompletionDate: "Any",
    estimatedCalls: 10
  });

  // Load campaign data when it becomes available
  useEffect(() => {
    if (campaignData) {
      setFormData({
        targetRegions: campaignData.targetRegions || [],
        startDate: campaignData.startDate || "Any",
        targetCompletionDate: campaignData.targetCompletionDate || "Any",
        estimatedCalls: campaignData.estimatedCalls || 10
      });
    }
  }, [campaignData]);

  const handleRegionChange = (region: string, checked: boolean) => {
    const newData = {
      ...formData,
      targetRegions: checked 
        ? [...formData.targetRegions, region]
        : formData.targetRegions.filter(r => r !== region)
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleInputChange = (field: keyof ScopeData, value: string | number) => {
    const newData = {
      ...formData,
      [field]: value
    };
    console.log('ScopeRefinement data change:', newData);
    setFormData(newData);
    onDataChange?.(newData);
  };

  // Check form completion and notify parent
  React.useEffect(() => {
    const hasValidDates = !!(formData.startDate && formData.startDate !== "Any" && 
                         formData.targetCompletionDate && formData.targetCompletionDate !== "Any");
    const isCompleted = formData.targetRegions.length > 0 && 
                       hasValidDates && 
                       formData.estimatedCalls > 0;
    onFormChange?.(isCompleted);
  }, [formData, onFormChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Campaign Scope
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-1">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Target regions */}
          <div>
            <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
              Target regions<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1">
              {targetRegions.map((region) => (
                <label key={region} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetRegions.includes(region)}
                    onChange={(e) => handleRegionChange(region, e.target.checked)}
                    className="w-3 h-3 text-primary-500  dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded focus:ring-1 focus:ring-primary-500"
                  />
                  <span className=" text-light-text dark:text-dark-text">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block font-medium text-light-text dark:text-dark-text mb-1">
              Campaign Timeline<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              {/* Start Date */}
              <div className="flex-1 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </div>
                <input
                  type="date"
                  value={formData.startDate === "Any" ? "" : formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  min={getTodayString()}
                  max={formData.targetCompletionDate !== "Any" ? formData.targetCompletionDate : undefined}
                  className="w-full pl-8 pr-2 py-1.5 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                  placeholder="Start date"
                />
              </div>

              {/* Arrow/Separator */}
              <div className="text-light-text-tertiary dark:text-dark-text-tertiary">→</div>

              {/* End Date */}
              <div className="flex-1 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </div>
                <input
                  type="date"
                  value={formData.targetCompletionDate === "Any" ? "" : formData.targetCompletionDate}
                  onChange={(e) => handleInputChange("targetCompletionDate", e.target.value)}
                  min={formData.startDate !== "Any" ? formData.startDate : getTodayString()}
                  className="w-full pl-8 pr-2 py-1.5 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                  placeholder="Completion date"
                />
              </div>
            </div>
            
            {/* Date Range Display */}
            {formData.startDate !== "Any" && formData.targetCompletionDate !== "Any" && (
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                {formatDateForDisplay(formData.startDate)} - {formatDateForDisplay(formData.targetCompletionDate)}
                {(() => {
                  const start = new Date(formData.startDate);
                  const end = new Date(formData.targetCompletionDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  return ` (${days} day${days !== 1 ? 's' : ''})`;
                })()}
              </p>
            )}
          </div>

          {/* Estimated number of calls */}
          <div className="w-1/2">
            <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
              Estimated number of calls<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.estimatedCalls}
              onChange={(e) => handleInputChange("estimatedCalls", parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1   dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              This helps us estimate your campaign budget
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
