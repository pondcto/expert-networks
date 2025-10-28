"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCampaign } from "../../lib/campaign-context";
import { Calendar, X } from "lucide-react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
    estimatedCalls: 10
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
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
      setFormData({
        targetRegions: campaignData.targetRegions || [],
        startDate: campaignData.startDate || "Any",
        targetCompletionDate: campaignData.targetCompletionDate || "Any",
        estimatedCalls: Number.isNaN(campaignData.estimatedCalls) || !campaignData.estimatedCalls ? 10 : campaignData.estimatedCalls
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
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const handleRegionChange = async (region: string, checked: boolean) => {
    setIsEditing(false); // Allow reload after save
    const newData = {
      ...formData,
      targetRegions: checked 
        ? [...formData.targetRegions, region]
        : formData.targetRegions.filter(r => r !== region)
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
      try {
        console.log('Auto-saving campaign on blur (Campaign Scope)...');
        await saveCampaign();
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
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
  
  // Helper to format date in local timezone (YYYY-MM-DD)
  const formatLocalDate = (date: Date): string => {
    const targetDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  };
  
  const handleDateRangeChange = async (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (selection && selection.startDate && selection.endDate) {
      setIsEditing(false); // Allow reload after save
      setDateRange([{
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection'
      }]);
      
      // Update form data using local system timezone (works for EST or any timezone)
      const startDate = formatLocalDate(selection.startDate);
      const endDate = formatLocalDate(selection.endDate);
      
      const newData = {
        ...formData,
        startDate,
        targetCompletionDate: endDate
      };
      
      setFormData(newData);
      onDataChange?.(newData);
      
      // Auto-save after date change - pass the new data directly
      if (!isNewCampaign && campaignData?.id) {
        try {
          console.log('Auto-saving campaign after date change...');
          await saveCampaign(newData);
        } catch (error) {
          console.error('Failed to auto-save campaign:', error);
        }
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
          <div className="relative">
            <label className="block font-medium text-light-text dark:text-dark-text mb-1">
              Campaign Timeline<span className="text-red-500">*</span>
            </label>
            
            {/* Date Display Button */}
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-3 py-2.5 dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-primary-500 transition-colors flex items-center justify-between group"
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
            
            {/* Date Range Picker Popover */}
            {showDatePicker && (
              <div 
                ref={datePickerRef}
                className="absolute z-50 mt-2 bg-white dark:bg-dark-surface shadow-xl rounded-lg border border-light-border dark:border-dark-border overflow-hidden"
                style={{
                  left: '50%',
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
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 bg-primary-500 text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Estimated number of calls */}
          <div className="w-1/2">
            <label className="block  font-medium text-light-text dark:text-dark-text mb-1">
              Estimated number of calls<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={Number.isNaN(formData.estimatedCalls) ? '' : formData.estimatedCalls}
              onChange={(e) => handleInputChange("estimatedCalls", parseInt(e.target.value) || 0)}
              onFocus={handleFocus}
              onBlur={handleBlur}
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
