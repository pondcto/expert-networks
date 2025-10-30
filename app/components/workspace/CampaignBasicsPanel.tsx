"use client";

import React, { useState, useEffect } from "react";
import { useCampaign } from "../../lib/campaign-context";

export interface CampaignBasicsPanelProps {
  onSubmit?: (data: CampaignData) => void;
  onFormChange?: (isCompleted: boolean) => void;
  onDataChange?: (data: CampaignData) => void;
}

export interface CampaignData {
  campaignName: string;
  projectCode: string;
  industryVertical: string;
  customIndustry?: string;
  briefDescription: string;
  expandedDescription: string;
}

const industryOptions = [
  "Any",
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Energy",
  "Transportation",
  "Media & Entertainment",
  "Real Estate",
  "Other"
];

export default function CampaignBasicsPanel({
  onSubmit,
  onFormChange,
  onDataChange,
}: CampaignBasicsPanelProps) {
  const { campaignData, saveCampaign, isNewCampaign } = useCampaign();
  const [formData, setFormData] = useState<CampaignData>({
    campaignName: "",
    projectCode: "",
    industryVertical: "Any",
    customIndustry: "",
    briefDescription: "",
    expandedDescription: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showHints, setShowHints] = useState({
    campaignName: false,
    industryVertical: false,
    briefDescription: false
  });

  // Load campaign data when it becomes available (but not while user is editing)
  useEffect(() => {
    if (campaignData && !isEditing) {
      setFormData({
        campaignName: campaignData.campaignName || "",
        projectCode: campaignData.projectCode || "",
        industryVertical: campaignData.industryVertical || "Any",
        customIndustry: campaignData.customIndustry || "",
        briefDescription: campaignData.briefDescription || "",
        expandedDescription: campaignData.expandedDescription || ""
      });
    }
  }, [campaignData, isEditing]);

  const handleInputChange = (field: keyof CampaignData, value: string) => {
    const newData = {
      ...formData,
      [field]: value
    };
    console.log('CampaignBasics data change:', newData);
    setFormData(newData);
    onDataChange?.(newData);
  };

  // Mark as editing when user focuses on a field
  const handleFocus = () => {
    setIsEditing(true);
  };

  // Auto-save on blur for existing campaigns
  const handleBlur = async () => {
    setIsEditing(false);
    
    if (!isNewCampaign && campaignData?.id) {
      // Check if any required field is blank
      const hasValidIndustry = formData.industryVertical !== "Any" && 
                               (formData.industryVertical !== "Other" || formData.customIndustry?.trim() !== "");
      const isAnyRequiredFieldBlank = 
        formData.campaignName.trim() === "" || 
        !hasValidIndustry || 
        formData.briefDescription.trim() === "";
      
      // If any required field is blank, restore from campaignData instead of saving
      if (isAnyRequiredFieldBlank) {
        console.log('Required field(s) are blank. Restoring previous values...');
        setFormData({
          campaignName: campaignData.campaignName || "",
          projectCode: campaignData.projectCode || "",
          industryVertical: campaignData.industryVertical || "Any",
          customIndustry: campaignData.customIndustry || "",
          briefDescription: campaignData.briefDescription || "",
          expandedDescription: campaignData.expandedDescription || ""
        });
        return;
      }
      
      // If all required fields are valid, save
      try {
        console.log('Auto-saving campaign on blur (Campaign Basics)...');
        await saveCampaign(formData);
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
  };

  // Check form completion and notify parent
  React.useEffect(() => {
    const hasValidIndustry = formData.industryVertical !== "Any" && 
                             (formData.industryVertical !== "Other" || formData.customIndustry?.trim() !== "");
    const isCompleted = formData.campaignName.trim() !== "" && 
                       hasValidIndustry && 
                       formData.briefDescription.trim() !== "";
    onFormChange?.(isCompleted);
  }, [formData, onFormChange]);

  // Listen for event to show required field hints
  React.useEffect(() => {
    const handleShowHints = () => {
      const hasValidIndustry = formData.industryVertical !== "Any" && 
                               (formData.industryVertical !== "Other" || formData.customIndustry?.trim() !== "");
      
      setShowHints({
        campaignName: formData.campaignName.trim() === "",
        industryVertical: !hasValidIndustry,
        briefDescription: formData.briefDescription.trim() === ""
      });

      // Auto-hide hints after 3 seconds
      setTimeout(() => {
        setShowHints({
          campaignName: false,
          industryVertical: false,
          briefDescription: false
        });
      }, 3000);
    };

    window.addEventListener('showRequiredFieldHints', handleShowHints);
    return () => {
      window.removeEventListener('showRequiredFieldHints', handleShowHints);
    };
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Campaign Setup
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-1">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            {/* Campaign name */}
            <div className="w-1/2">
              <label className="block font-medium text-light-text dark:text-dark-text mb-1">
                Campaign name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => handleInputChange("campaignName", e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Campaign name, example: Company - Market Analysis"
                  className={`w-full px-2 py-1 dark:bg-dark-background-secondary border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                    showHints.campaignName ? 'border-red-500' : 'border-light-border dark:border-dark-border'
                  }`}
                />
                {showHints.campaignName && (
                  <div className="absolute top-full left-0 text-xs text-red-600 dark:text-red-400">
                    Campaign name is required
                  </div>
                )}
              </div>
            </div>

            {/* Project code */}
            <div className="w-1/2">
              <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
                Project code (include if available)
              </label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => handleInputChange("projectCode", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Project code"
                className="w-full px-2 py-1   dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Industry vertical */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block font-medium text-light-text dark:text-dark-text mb-1">
                Industry vertical<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.industryVertical}
                  onChange={(e) => handleInputChange("industryVertical", e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={`w-full px-2 py-1 dark:bg-dark-background-secondary border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer ${
                    showHints.industryVertical ? 'border-red-500' : 'border-light-border dark:border-dark-border'
                  }`}
                >
                  {industryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {showHints.industryVertical && (
                  <div className="absolute top-full left-0 text-xs text-red-600 dark:text-red-400">
                    Please select an industry
                  </div>
                )}
              </div>
            </div>
            
            {/* Custom Industry Input - shown when "Other" is selected */}
            {formData.industryVertical === "Other" && (
              <div className="w-1/2">
                <label className="block font-medium text-light-text dark:text-dark-text mb-1">
                  <span className="text-red-500">&nbsp;</span>
                </label>
                <input
                  type="text"
                  value={formData.customIndustry || ""}
                  onChange={(e) => handleInputChange("customIndustry", e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Please specify your industry..."
                  className="w-full px-2 py-1 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Brief description */}
          <div>
            <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
              Brief description<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.briefDescription}
                onChange={(e) => handleInputChange("briefDescription", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="One-line description of your campaign"
                className={`w-full px-2 py-1 dark:bg-dark-background-secondary border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent ${
                  showHints.briefDescription ? 'border-red-500' : 'border-light-border dark:border-dark-border'
                }`}
              />
              {showHints.briefDescription && (
                <div className="absolute top-full left-0 text-xs text-red-600 dark:text-red-400">
                  Brief description is required
                </div>
              )}
            </div>
          </div>

          {/* Expanded description */}
          <div>
            <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
              Expanded description (optional)
            </label>
            <textarea
              value={formData.expandedDescription}
              onChange={(e) => handleInputChange("expandedDescription", e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Provide additional context for your campaign brief..."
              rows={3}
              className="w-full px-2 py-1   dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none resize-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
