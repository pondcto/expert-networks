"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCampaign, CampaignData } from "../../lib/campaign-context";
import { Calendar, X } from "lucide-react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface ExtendedCampaignData extends CampaignData {
  targetRegionsOther?: string;
}

export interface ScopeRefinementPanelProps {
  onSubmit?: (data: ScopeData) => void;
  onFormChange?: (isCompleted: boolean) => void;
  onDataChange?: (data: ScopeData) => void;
}

export interface ScopeData {
  targetRegions: string[];
  startDate: string;
  targetCompletionDate: string;
  minCalls: number;
  maxCalls: number;
  // Optional details when "Other" is selected for regions
  targetRegionsOther?: string;
}

const targetRegions = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa",
  "Other"
];

// Helper to format date for display
const formatDateForDisplay = (dateString: string) => {
  if (!dateString || dateString === "Any") return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ScopeRefinementPanel({
  onSubmit,
  onFormChange,
  onDataChange,
}: ScopeRefinementPanelProps) {
  const { campaignData, saveCampaign, isNewCampaign } = useCampaign();
  const [formData, setFormData] = useState<ScopeData>({
    targetRegions: [],
    startDate: "Any",
    targetCompletionDate: "Any",
    minCalls: 5,
    maxCalls: 15,
    targetRegionsOther: ""
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const [showHints, setShowHints] = useState({
    targetRegions: false,
    dates: false,
    calls: false
  });
  
  const [dateRange, setDateRange] = useState<Array<{ startDate: Date; endDate: Date; key: string }>>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Load campaign data when it becomes available (but not while user is editing)
  useEffect(() => {
    if (campaignData && !isEditing) {
      // Handle backward compatibility: if old estimatedCalls exists, use it for range
      let minCalls = 5;
      let maxCalls = 15;
      
      if (campaignData.minCalls !== undefined && campaignData.maxCalls !== undefined) {
        minCalls = campaignData.minCalls;
        maxCalls = campaignData.maxCalls;
      } else if (campaignData.estimatedCalls && !Number.isNaN(campaignData.estimatedCalls)) {
        // Convert old single value to a range (±5 from estimated)
        const estimate = campaignData.estimatedCalls;
        minCalls = Math.max(1, estimate - 5);
        maxCalls = estimate + 5;
      }
      
      setFormData({
        targetRegions: campaignData.targetRegions || [],
        startDate: campaignData.startDate || "Any",
        targetCompletionDate: campaignData.targetCompletionDate || "Any",
        minCalls,
        maxCalls,
        targetRegionsOther: (campaignData as ExtendedCampaignData).targetRegionsOther || ""
      });
      
      // Update date range if campaign has dates
      if (campaignData.startDate && campaignData.startDate !== "Any" &&
          campaignData.targetCompletionDate && campaignData.targetCompletionDate !== "Any") {
        setDateRange([{
          startDate: new Date(campaignData.startDate),
          endDate: new Date(campaignData.targetCompletionDate),
          key: 'selection'
        }]);
      }
    }
  }, [campaignData, isEditing]);
  
  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node) &&
          dateButtonRef.current && !dateButtonRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    
    const updatePosition = () => {
      if (dateButtonRef.current && showDatePicker) {
        const rect = dateButtonRef.current.getBoundingClientRect();
        setDatePickerPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2
        });
      }
    };
    
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDatePicker]);

  const handleRegionChange = async (region: string, checked: boolean) => {
    setIsEditing(false); // Allow reload after save
    const newRegions = checked 
      ? [...formData.targetRegions, region]
      : formData.targetRegions.filter(r => r !== region);
    
    // If trying to deselect all regions, restore previous values instead
    if (newRegions.length === 0 && !isNewCampaign && campaignData?.targetRegions && campaignData.targetRegions.length > 0) {
      console.log('Cannot deselect all regions. Restoring previous values...');
      setFormData({
        ...formData,
        targetRegions: campaignData.targetRegions
      });
      return;
    }
    
    const newData = {
      ...formData,
      targetRegions: newRegions
    };
    setFormData(newData);
    onDataChange?.(newData);
    
    // Auto-save after region change - pass the new data directly
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after region change...');
        await saveCampaign(newData);
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
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

  // Mark as editing when user focuses on a field
  const handleFocus = () => {
    setIsEditing(true);
  };

  // Auto-save on blur for existing campaigns
  const handleBlur = async () => {
    setIsEditing(false);
    
    if (!isNewCampaign && campaignData?.id) {
      // Check if any required field is blank/invalid
      const hasValidDates = !!(formData.startDate && formData.startDate !== "Any" && 
                              formData.targetCompletionDate && formData.targetCompletionDate !== "Any");
      const hasValidCalls = formData.minCalls > 0 && 
                           formData.maxCalls > 0 && 
                           formData.minCalls <= formData.maxCalls &&
                           !Number.isNaN(formData.minCalls) &&
                           !Number.isNaN(formData.maxCalls);
      
      const isAnyRequiredFieldBlank = 
        formData.targetRegions.length === 0 || 
        !hasValidDates || 
        !hasValidCalls;
      
      // If any required field is blank/invalid, restore from campaignData instead of saving
      if (isAnyRequiredFieldBlank) {
        console.log('Required field(s) are blank or invalid. Restoring previous values...');
        
        // Handle backward compatibility when restoring
        let minCalls = 5;
        let maxCalls = 15;
        if (campaignData.minCalls !== undefined && campaignData.maxCalls !== undefined) {
          minCalls = campaignData.minCalls;
          maxCalls = campaignData.maxCalls;
        } else if (campaignData.estimatedCalls && !Number.isNaN(campaignData.estimatedCalls)) {
          const estimate = campaignData.estimatedCalls;
          minCalls = Math.max(1, estimate - 5);
          maxCalls = estimate + 5;
        }
        
        setFormData({
          targetRegions: campaignData.targetRegions || [],
          startDate: campaignData.startDate || "Any",
          targetCompletionDate: campaignData.targetCompletionDate || "Any",
          minCalls,
          maxCalls
        });
        
        // Also restore date range picker state
        if (campaignData.startDate && campaignData.startDate !== "Any" &&
            campaignData.targetCompletionDate && campaignData.targetCompletionDate !== "Any") {
          setDateRange([{
            startDate: new Date(campaignData.startDate),
            endDate: new Date(campaignData.targetCompletionDate),
            key: 'selection'
          }]);
        }
        return;
      }
      
      // If all required fields are valid, save
      try {
        console.log('Auto-saving campaign on blur (Campaign Scope)...');
        await saveCampaign(formData);
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
  };

  // Check form completion and notify parent
  React.useEffect(() => {
    const hasValidDates = !!(formData.startDate && formData.startDate !== "Any" && 
                         formData.targetCompletionDate && formData.targetCompletionDate !== "Any");
    const hasValidCalls = formData.minCalls > 0 && 
                         formData.maxCalls > 0 && 
                         formData.minCalls <= formData.maxCalls;
    const isCompleted = formData.targetRegions.length > 0 && 
                       hasValidDates && 
                       hasValidCalls;
    onFormChange?.(isCompleted);
  }, [formData, onFormChange]);

  // Listen for event to show required field hints
  React.useEffect(() => {
    const handleShowHints = () => {
      const hasValidDates = !!(formData.startDate && formData.startDate !== "Any" && 
                              formData.targetCompletionDate && formData.targetCompletionDate !== "Any");
      const hasRegions = formData.targetRegions.length > 0;
      const hasValidCalls = formData.minCalls > 0 && 
                           formData.maxCalls > 0 && 
                           formData.minCalls <= formData.maxCalls;
      
      setShowHints({
        targetRegions: !hasRegions,
        dates: !hasValidDates,
        calls: !hasValidCalls
      });

      // Auto-hide hints after 3 seconds
      setTimeout(() => {
        setShowHints({
          targetRegions: false,
          dates: false,
          calls: false
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
  
  // Helper to format date in local timezone (YYYY-MM-DD)
  const formatLocalDate = (date: Date): string => {
    const targetDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  };
  
  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (selection && selection.startDate && selection.endDate) {
      // Only update the visual date range picker, don't save yet
      setDateRange([{
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection'
      }]);
    }
  };
  
  // Apply dates when "Apply" button is clicked
  const handleApplyDates = async () => {
    setIsEditing(false); // Allow reload after save
    
    // Update form data using local system timezone (works for EST or any timezone)
    const startDate = formatLocalDate(dateRange[0].startDate);
    const endDate = formatLocalDate(dateRange[0].endDate);
    
    const newData = {
      ...formData,
      startDate,
      targetCompletionDate: endDate
    };
    
    setFormData(newData);
    onDataChange?.(newData);
    
    // Close the date picker
    setShowDatePicker(false);
    
    // Auto-save after date change - pass the new data directly
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after applying date change...');
        await saveCampaign(newData);
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
  };
  
  const clearDates = async () => {
    setIsEditing(false); // Allow reload after save
    const newData = {
      ...formData,
      startDate: "Any",
      targetCompletionDate: "Any"
    };
    setFormData(newData);
    onDataChange?.(newData);
    setDateRange([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }]);
    
    // Close the date picker
    setShowDatePicker(false);
    
    // Auto-save after clearing dates - pass the new data directly
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after clearing dates...');
        await saveCampaign(newData);
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
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
            <div className="relative">
              <div className={`grid grid-cols-2 gap-1 p-2 border rounded ${
                showHints.targetRegions ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-transparent'
              }`}>
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
              {formData.targetRegions.includes('Other') && (
                <div className="mt-2">
                  <label className="block text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Please specify countries/regions of interest
                  </label>
                  <input
                    type="text"
                    value={formData.targetRegionsOther || ''}
                    onChange={(e) => handleInputChange('targetRegionsOther', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="e.g., Nordics (Sweden, Norway), GCC, Benelux, etc."
                    className="w-full px-3 py-2 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-sm text-light-text dark:text-dark-text placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
              {showHints.targetRegions && (
                <div className="absolute top-full left-0 text-xs text-red-600 dark:text-red-400">
                  Please select at least one region
                </div>
              )}
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="relative">
            <label className="block font-medium text-light-text dark:text-dark-text mb-1">
              Campaign Timeline<span className="text-red-500">*</span>
            </label>
            
            {/* Date Display Button */}
            <div 
              ref={dateButtonRef}
              onClick={() => {
                if (dateButtonRef.current) {
                  const rect = dateButtonRef.current.getBoundingClientRect();
                  setDatePickerPosition({
                    top: rect.bottom + 8,
                    left: rect.left + rect.width / 2
                  });
                }
                
                // When opening the date picker, restore the current saved dates
                if (!showDatePicker) {
                  if (formData.startDate !== "Any" && formData.targetCompletionDate !== "Any") {
                    setDateRange([{
                      startDate: new Date(formData.startDate),
                      endDate: new Date(formData.targetCompletionDate),
                      key: 'selection'
                    }]);
                  } else {
                    setDateRange([{
                      startDate: new Date(),
                      endDate: new Date(),
                      key: 'selection'
                    }]);
                  }
                }
                
                setShowDatePicker(!showDatePicker);
              }}
              className={`w-1/2 px-3 py-2 dark:bg-dark-background-secondary border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-primary-500 transition-colors flex items-center justify-between group ${
                showHints.dates ? 'border-red-500' : 'border-light-border dark:border-dark-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500 transition-colors" />
                <span className="text-sm">
                  {formData.startDate !== "Any" && formData.targetCompletionDate !== "Any" ? (
                    <>
                      <span className="font-medium">{formatDateForDisplay(formData.startDate)}</span>
                      <span className="mx-2 text-light-text-tertiary dark:text-dark-text-tertiary">→</span>
                      <span className="font-medium">{formatDateForDisplay(formData.targetCompletionDate)}</span>
                    </>
                  ) : (
                    <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Select campaign dates</span>
                  )}
                </span>
              </div>
              {formData.startDate !== "Any" && formData.targetCompletionDate !== "Any" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDates();
                  }}
                  className="p-1 hover:bg-light-background-secondary dark:hover:bg-dark-background rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </button>
              )}
            </div>
            
            {/* Date Range Display with Duration */}
            {formData.startDate !== "Any" && formData.targetCompletionDate !== "Any" && (
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1.5 flex items-center gap-1">
                <span>Campaign duration:</span>
                <span className="font-medium text-primary-500">
                  {(() => {
                    const start = new Date(formData.startDate);
                    const end = new Date(formData.targetCompletionDate);
                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return `${days} day${days !== 1 ? 's' : ''}`;
                  })()}
                </span>
              </p>
            )}

            {/* Hint Message */}
            {showHints.dates && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                Please select campaign start and end dates
              </div>
            )}
            
            {/* Date Range Picker Popover */}
            {showDatePicker && (
              <div 
                ref={datePickerRef}
                className="fixed z-[9999] bg-white dark:bg-dark-surface shadow-xl rounded-lg border border-light-border dark:border-dark-border overflow-hidden"
                style={{
                  top: `${datePickerPosition.top}px`,
                  left: `${datePickerPosition.left}px`,
                  transform: 'translateX(-50%) scale(0.85)',
                  transformOrigin: 'top center'
                }}
              >
                <style jsx global>{`
                  .rdrCalendarWrapper {
                    background: transparent !important;
                    color: inherit !important;
                    font-size: 11px !important;
                  }
                  
                  .dark .rdrCalendarWrapper {
                    background: transparent !important;
                  }
                  
                  .rdrMonth {
                    padding: 0.25rem !important;
                    width: 280px !important;
                  }
                  
                  .rdrMonthAndYearWrapper {
                    padding-top: 0.25rem !important;
                    height: 48px !important;
                  }
                  
                  .rdrMonthAndYearPickers {
                    font-size: 12px !important;
                  }
                  
                  .rdrMonthAndYearPickers select {
                    background: var(--color-background-secondary) !important;
                    color: var(--color-text) !important;
                    border: 1px solid var(--color-border) !important;
                    border-radius: 0.375rem !important;
                    padding: 0.125rem 0.25rem !important;
                    font-size: 11px !important;
                  }
                  
                  .dark .rdrMonthAndYearPickers select {
                    background: var(--dark-background-secondary) !important;
                    color: var(--dark-text) !important;
                    border-color: var(--dark-border) !important;
                  }
                  
                  .rdrWeekDays {
                    padding: 0 !important;
                  }
                  
                  .rdrWeekDay {
                    color: inherit !important;
                    font-size: 10px !important;
                    line-height: 2em !important;
                    font-weight: 500 !important;
                  }
                  
                  .dark .rdrWeekDay {
                    color: var(--dark-text-secondary) !important;
                  }
                  
                  .rdrDays {
                    padding: 0 !important;
                  }
                  
                  .rdrDay {
                    height: 2.5em !important;
                  }
                  
                  .rdrDayNumber {
                    font-size: 11px !important;
                    font-weight: 400 !important;
                  }
                  
                  .rdrDayNumber span {
                    color: inherit !important;
                  }
                  
                  .dark .rdrDayNumber span {
                    color: var(--dark-text) !important;
                  }
                  
                  .rdrDayPassive .rdrDayNumber span {
                    color: #999 !important;
                    font-size: 10px !important;
                  }
                  
                  .dark .rdrDayPassive .rdrDayNumber span {
                    color: #666 !important;
                  }
                  
                  .rdrDateDisplayWrapper {
                    background: transparent !important;
                  }
                  
                  .rdrDateDisplay {
                    margin: 0.5rem !important;
                  }
                  
                  .rdrDateInput {
                    background: var(--color-background-secondary) !important;
                    border: 1px solid var(--color-border) !important;
                  }
                  
                  .dark .rdrDateInput {
                    background: var(--dark-background-secondary) !important;
                    border-color: var(--dark-border) !important;
                  }
                  
                  .rdrDateInput input {
                    color: inherit !important;
                  }
                  
                  .dark .rdrDateInput input {
                    color: var(--dark-text) !important;
                  }
                  
                  .rdrDayToday .rdrDayNumber span:after {
                    background: rgb(59 130 246) !important;
                    bottom: 2px !important;
                  }
                  
                  .rdrStartEdge,
                  .rdrEndEdge,
                  .rdrInRange {
                    color: white !important;
                  }
                  
                  .rdrStartEdge {
                    background: rgb(59 130 246) !important;
                    border-radius: 0.25rem 0 0 0.25rem !important;
                  }
                  
                  .rdrEndEdge {
                    background: rgb(59 130 246) !important;
                    border-radius: 0 0.25rem 0.25rem 0 !important;
                  }
                  
                  .rdrInRange {
                    background: rgb(59 130 246 / 0.15) !important;
                  }
                  
                  .rdrDay:not(.rdrDayPassive) .rdrInRange ~ .rdrDayNumber span {
                    color: rgb(59 130 246) !important;
                  }
                  
                  .rdrDay:not(.rdrDayPassive) .rdrStartEdge ~ .rdrDayNumber span,
                  .rdrDay:not(.rdrDayPassive) .rdrEndEdge ~ .rdrDayNumber span {
                    color: white !important;
                  }
                  
                  .rdrNextPrevButton {
                    background: transparent !important;
                    border-radius: 0.25rem !important;
                    width: 24px !important;
                    height: 24px !important;
                  }
                  
                  .rdrNextPrevButton:hover {
                    background: var(--color-background-secondary) !important;
                  }
                  
                  .dark .rdrNextPrevButton:hover {
                    background: var(--dark-background-secondary) !important;
                  }
                  
                  .rdrPprevButton i,
                  .rdrNextButton i {
                    border-color: currentColor !important;
                    border-width: 2px 2px 0 0 !important;
                    margin: 0 !important;
                  }
                  
                  .rdrMonthPicker select,
                  .rdrYearPicker select {
                    padding: 2px 4px !important;
                    min-width: 60px !important;
                  }
                `}</style>
                
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="horizontal"
                  rangeColors={['rgb(59 130 246)']}
                  minDate={new Date()}
                  showDateDisplay={false}
                />
                
                <div className="px-3 py-2 border-t border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background flex justify-between items-center">
                  <button
                    type="button"
                    onClick={clearDates}
                    className="text-xs text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
                  >
                    Clear dates
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyDates}
                    className="px-3 py-1 bg-primary-500 text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Number of calls range */}
          <div>
            <label className="block font-medium text-light-text dark:text-dark-text">
              Number of calls<span className="text-red-500">*</span>
            </label>
            <div className={`p-3 ${
              showHints.calls ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-light-border dark:border-dark-border'
            }`}>
              {/* Single-row layout: min input, slider, max input */}
              <div className="flex items-center gap-3 w-fit max-w-full">
                {/* Min Input */}
                <div className="w-20 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max={formData.maxCalls}
                    value={Number.isNaN(formData.minCalls) ? '' : formData.minCalls}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      handleInputChange("minCalls", Math.max(1, Math.min(value, formData.maxCalls)));
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Slider */}
                <div className="relative py-2" style={{ width: '220px', flexShrink: 0 }}>
                  {/* Track */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full" />

                  {/* Active Range */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary-500 rounded-full"
                    style={{
                      left: `${((formData.minCalls - 1) / 99) * 100}%`,
                      right: `${100 - ((formData.maxCalls - 1) / 99) * 100}%`
                    }}
                  />

                  {/* Min Thumb */}
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.minCalls}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value <= formData.maxCalls) {
                        handleInputChange("minCalls", value);
                      }
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-dark-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-dark-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto"
                    style={{ zIndex: 5, pointerEvents: 'none', top: 0 }}
                  />

                  {/* Max Thumb */}
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.maxCalls}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= formData.minCalls) {
                        handleInputChange("maxCalls", value);
                      }
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-dark-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-dark-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto"
                    style={{ zIndex: 4, pointerEvents: 'none', top: 0 }}
                  />
                </div>

                {/* Max Input */}
                <div className="w-20 flex-shrink-0">
                  <input
                    type="number"
                    min={formData.minCalls}
                    max="100"
                    value={Number.isNaN(formData.maxCalls) ? '' : formData.maxCalls}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || formData.minCalls;
                      handleInputChange("maxCalls", Math.max(formData.minCalls, Math.min(value, 100)));
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1.5 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {showHints.calls && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                Please enter a valid range (min must be ≤ max)
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
