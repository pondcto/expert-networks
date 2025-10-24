"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Interview } from "../../types";
import { ProposedExpert, mockVendors } from "../../lib/mockData";
import { 
  timeSlots, 
  daysOfWeek, 
  generateWeekDays, 
  navigateWeek,
  format, 
  startOfWeek,
  isSameDay, 
  isToday,
  parseISO,
  startOfDay,
  isBefore
} from "../../utils/dateUtils";
import { mockInterviews } from "../../data";
import { mockProposedExperts } from "../../lib/mockData";

interface ExpertSchedulingPanelProps {
  selectedExpert?: ProposedExpert | null;
}

export default function ExpertSchedulingPanel({ selectedExpert }: ExpertSchedulingPanelProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [draggedInterview, setDraggedInterview] = useState<Interview | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartDuration, setResizeStartDuration] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; interviewId: string } | null>(null);

  const weekDays = generateWeekDays(currentWeek);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });

  const isPastDay = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    return isBefore(checkDate, today);
  };

  const isInterviewExpired = (interview: Interview): boolean => {
    const today = startOfDay(new Date());
    const interviewDate = startOfDay(interview.date);
    
    // Only return true if the interview date is before today (not including today)
    return isBefore(interviewDate, today);
  };

  // Assign unique colors to experts (matching the first 7 from mockProposedExperts)
  const expertColors: { [key: string]: string } = {
    "Emily Rodriguez": "blue",
    "Robert James": "green",
    "Jennifer Lee": "purple",
    "Thomas Edward": "orange",
    "Amanda Wilson": "red",
    "Kevin Park": "pink",
    "Lisa Martinez": "cyan"
  };

  const getExpertColor = (expertName: string): string => {
    return expertColors[expertName] || "gray";
  };

  const getColorTagClass = (color: string): string => {
    switch (color) {
      case "blue":
        return "bg-blue-100 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700/50 text-blue-900 dark:text-blue-300";
      case "green":
        return "bg-green-100 dark:bg-green-950/40 border-green-400 dark:border-green-700/50 text-green-900 dark:text-green-300";
      case "purple":
        return "bg-purple-100 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700/50 text-purple-900 dark:text-purple-300";
      case "orange":
        return "bg-orange-100 dark:bg-orange-950/40 border-orange-400 dark:border-orange-700/50 text-orange-900 dark:text-orange-300";
      case "red":
        return "bg-red-100 dark:bg-red-950/40 border-red-400 dark:border-red-700/50 text-red-900 dark:text-red-300";
      case "pink":
        return "bg-pink-100 dark:bg-pink-950/40 border-pink-400 dark:border-pink-700/50 text-pink-900 dark:text-pink-300";
      case "cyan":
        return "bg-cyan-100 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-700/50 text-cyan-900 dark:text-cyan-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/40 border-gray-400 dark:border-gray-700/50 text-gray-900 dark:text-gray-300";
    }
  };

  const getExpertColorDot = (color: string) => {
    const colorMap: { [key: string]: string } = {
      "blue": "bg-blue-500",
      "green": "bg-green-500",
      "purple": "bg-purple-500",
      "orange": "bg-orange-500",
      "red": "bg-red-500",
      "pink": "bg-pink-500",
      "cyan": "bg-cyan-500"
    };
    return colorMap[color] || "bg-gray-500";
  };

  const getTimeSlotPosition = (time: string) => {
    // Find the index of the time in the timeSlots array
    const normalizedTime = time.toLowerCase().replace(/\s/g, '');
    const timeIndex = timeSlots.findIndex(slot => 
      slot.toLowerCase().replace(/\s/g, '') === normalizedTime
    );
    return timeIndex >= 0 ? timeIndex : 0;
  };

  const calculateEndTime = useCallback((startTime: string, duration: number): string => {
    const startIndex = getTimeSlotPosition(startTime);
    const endIndex = startIndex + (duration / 60);
    return timeSlots[endIndex] || timeSlots[timeSlots.length - 1];
  }, []);


  const getInterviewsForDay = useCallback((date: Date) => {
    return interviews.filter(interview => isSameDay(interview.date, date));
  }, [interviews]);


  const handleDragStart = (e: React.DragEvent, interview: Interview) => {
    if (isResizing || isInterviewExpired(interview)) {
      e.preventDefault();
      return;
    }
    setDraggedInterview(interview);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Check if a time slot overlaps with existing interviews
  const checkOverlap = (
    date: Date, 
    startTime: string, 
    duration: number, 
    excludeId?: string
  ): boolean => {
    const startIndex = getTimeSlotPosition(startTime);
    const endIndex = startIndex + (duration / 60);
    const newSlots = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
    
    // Get all interviews on the same day, excluding the one being moved/resized
    const dayInterviews = interviews.filter(
      interview => isSameDay(interview.date, date) && interview.id !== excludeId
    );
    
    // Check if any existing interview overlaps with the new time slots
    return dayInterviews.some(interview => {
      const existingStartIndex = getTimeSlotPosition(interview.time);
      const existingEndIndex = existingStartIndex + (interview.duration / 60);
      const existingSlots = Array.from(
        { length: existingEndIndex - existingStartIndex }, 
        (_, i) => existingStartIndex + i
      );
      
      // Check if there's any overlap between the slot arrays
      return newSlots.some(slot => existingSlots.includes(slot));
    });
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date, timeSlot: string) => {
    e.preventDefault();
    
    if (isResizing) {
      return;
    }
    
    if (draggedInterview) {
      const newTime = timeSlot;
      const newDate = targetDate;
      
      // Check for overlap before moving
      const hasOverlap = checkOverlap(newDate, newTime, draggedInterview.duration, draggedInterview.id);
      
      if (hasOverlap) {
        console.log("Cannot move: Schedule overlaps with existing interview");
        setDraggedInterview(null);
        return;
      }
      
      const newEndTime = calculateEndTime(newTime, draggedInterview.duration);
      
      // Update the dragged interview while preserving others
      setInterviews(interviews.map(interview => 
        interview.id === draggedInterview.id
          ? {
              ...draggedInterview,
              date: newDate,
              time: newTime,
              endTime: newEndTime
            }
          : interview
      ));
    }
    
    setDraggedInterview(null);
  };

  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    // Check for overlap before creating
    const hasOverlap = checkOverlap(date, timeSlot, 60);
    
    if (hasOverlap) {
      console.log("Cannot create: Schedule overlaps with existing interview");
      return;
    }
    
    const newInterview: Interview = {
      id: Date.now().toString(),
      expertName: selectedExpert?.name || "Expert Name",
      time: timeSlot,
      date: date,
      status: "pending",
      duration: 60,
      endTime: calculateEndTime(timeSlot, 60)
    };
    
    // Add new interview to existing ones instead of replacing
    setInterviews([...interviews, newInterview]);
  };

  const handleResizeStart = (e: React.MouseEvent, interview: Interview) => {
    e.stopPropagation();
    if (isInterviewExpired(interview)) {
      return;
    }
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartDuration(interview.duration);
    setDraggedInterview(interview);
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !draggedInterview) return;
    
    const deltaY = e.clientY - resizeStartY;
    const deltaSlots = Math.round(deltaY / 30); // 30px per 1-hour slot
    const newDuration = Math.max(60, Math.min(120, resizeStartDuration + (deltaSlots * 60))); // Limit to 1-2 hours
    
    // Check for overlap with the new duration
    const hasOverlap = checkOverlap(
      draggedInterview.date, 
      draggedInterview.time, 
      newDuration, 
      draggedInterview.id
    );
    
    // Only update if there's no overlap
    if (!hasOverlap) {
      const newEndTime = calculateEndTime(draggedInterview.time, newDuration);
      
      // Update the resized interview while preserving others
      setInterviews(interviews.map(interview => 
        interview.id === draggedInterview.id
          ? {
              ...draggedInterview,
              duration: newDuration,
              endTime: newEndTime
            }
          : interview
      ));
    }
  }, [isResizing, draggedInterview, resizeStartY, resizeStartDuration, calculateEndTime, interviews, checkOverlap]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setDraggedInterview(null);
    setResizeStartY(0);
    setResizeStartDuration(0);
  }, []);

  // Handle mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const handleNavigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(navigateWeek(currentWeek, direction));
  };

  const handleContextMenu = (e: React.MouseEvent, interview: Interview) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInterviewExpired(interview)) {
      return;
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      interviewId: interview.id
    });
  };

  const handleDeleteInterview = (interviewId: string) => {
    setInterviews(interviews.filter(interview => interview.id !== interviewId));
    setContextMenu(null);
  };

  const _handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Get unique experts from interviews
  const uniqueExperts = Array.from(new Set(interviews.map(i => i.expertName)));

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-title font-semibold text-light-text dark:text-dark-text mb-2">
            Expert Scheduling
          </h3>
          {/* Expert Color Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {uniqueExperts.map((expertName, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getExpertColorDot(getExpertColor(expertName))}`}></div>
                <span>{expertName}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedExpert && (
            <div className="flex items-center gap-2 pr-3 border-r border-light-border dark:border-dark-border">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image src={selectedExpert.avatar} alt={selectedExpert.name} width={28} height={28} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-light-text dark:text-dark-text truncate max-w-[18ch]">{selectedExpert.name}</span>
                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[18ch]">{selectedExpert.title}</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => handleNavigateWeek("prev")}
            className="px-2 py-1 text-sm border border-light-border dark:border-dark-border rounded hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            ←
          </button>
          <select 
            value={format(currentWeek, "yyyy-MM-dd")}
            onChange={(e) => setCurrentWeek(parseISO(e.target.value))}
            className="px-2 py-1 text-sm border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface"
          >
            <option value={format(currentWeek, "yyyy-MM-dd")}>
              Week of {format(weekStart, "MMM d")}
            </option>
          </select>
          <button 
            onClick={() => handleNavigateWeek("next")}
            className="px-2 py-1 text-sm border border-light-border dark:border-dark-border rounded hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            →
          </button>

          <button
            className="px-4 py-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors h-6 flex items-center justify-center"
          >
            Schedule
        </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-0 border border-light-border dark:border-dark-border rounded-lg">
          {/* Time column header */}
          <div className="sticky top-0 p-2 text-body-md font-medium text-light-text-secondary dark:text-dark-text-secondary border-r border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface z-20">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
              GMT - 05
            </div>
          </div>
          
          {/* Day headers */}
          {weekDays.slice(0, 7).map((day, index) => {
            const isPast = isPastDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`sticky top-0 p-2 text-center border-r border-light-border dark:border-dark-border last:border-r-0 z-20 ${
                  isCurrentDay ? 'bg-blue-50 dark:bg-blue-950' : 'bg-light-surface dark:bg-dark-surface'
                } ${isPast ? 'opacity-50' : ''}`}
              >
                <div className={`text-sm font-medium ${isPast ? 'text-gray-400 dark:text-gray-600' : 'text-light-text dark:text-dark-text'}`}>
                  {daysOfWeek[index]}
                </div>
                <div className={`text-lg font-bold ${
                  isCurrentDay 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                    : isPast
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                }`}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}

          {/* Time slots and calendar grid */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <React.Fragment key={timeIndex}>
              {/* Time label */}
              <div className="p-2 text-sm text-light-text-secondary dark:text-dark-text-secondary border-r border-t border-light-border dark:border-dark-border">
                {timeSlot}
              </div>
              
              {/* Day columns */}
              {weekDays.slice(0, 7).map((day, dayIndex) => {
                const dayInterviews = getInterviewsForDay(day);
                const slotInterviews = dayInterviews.filter(interview => 
                  getTimeSlotPosition(interview.time) === timeIndex
                );
                const isPast = isPastDay(day);
                const isCurrentDay = isToday(day);
                
                // Check if this time slot is occupied by the single interview
                const isOccupied = dayInterviews.some(interview => {
                  const startIndex = getTimeSlotPosition(interview.time);
                  const durationSlots = interview.duration / 60;
                  const occupiedSlots = Array.from({ length: durationSlots }, (_, i) => startIndex + i);
                  return occupiedSlots.includes(timeIndex);
                });
                
                return (
                  <div
                    key={dayIndex}
                    className={`relative h-[60px] border-r border-t border-light-border dark:border-dark-border last:border-r-0 ${
                      isCurrentDay ? 'bg-blue-50 dark:bg-blue-950' : ''
                    } ${isPast ? 'bg-gray-100 dark:bg-gray-900 opacity-40' : ''} ${
                      !isOccupied && !isPast ? 'hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, timeSlot)}
                    onClick={() => !isOccupied && !isPast && handleTimeSlotClick(day, timeSlot)}
                  >
                    {slotInterviews.map((interview) => {
                      const slotHeight = (interview.duration / 60) * 60;
                      // Find the expert data for this interview
                      const expertData = mockProposedExperts.find(expert => expert.name === interview.expertName);
                      const expertColor = getExpertColor(interview.expertName);
                      
                      return (
                        <div
                          key={interview.id}
                          draggable={!isResizing && !isInterviewExpired(interview)}
                          onDragStart={(e) => handleDragStart(e, interview)}
                          onContextMenu={(e) => handleContextMenu(e, interview)}
                          className={`absolute text-xs border-2 ${
                            isInterviewExpired(interview) 
                              ? 'opacity-60 cursor-not-allowed' 
                              : isResizing 
                              ? 'cursor-default' 
                              : 'cursor-move'
                          } ${getColorTagClass(expertColor)} rounded`}
                          style={{
                            height: `${slotHeight}px`,
                            zIndex: 10
                          }}
                        >
                          <div className="flex items-start gap-1 h-full p-2">
                            <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                              <Image src={expertData?.avatar || "/images/avatar/John Robert.png"} alt="Expert" width={28} height={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs leading-tight break-words">{interview.expertName}</div>
                              <div className="text-xs mt-1 leading-tight break-words">
                                {interview.time} - {interview.endTime}
                              </div>
                            </div>
                          </div>
                          {/* Resize handle at the bottom */}
                          {!isInterviewExpired(interview) && (
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-900/20 dark:hover:bg-white/10 opacity-0 hover:opacity-100 transition-opacity"
                              onMouseDown={(e) => handleResizeStart(e, interview)}
                              title="Drag to resize duration"
                            >
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-300 rounded"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-lg py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleDeleteInterview(contextMenu.interviewId)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Schedule
          </button>
        </div>
      )}
    </div>
  );
}
