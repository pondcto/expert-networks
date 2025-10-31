"use client";

import React, { useState } from "react";
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

import { Interview } from "../../types";
import { mockInterviews } from "../../data";

export default function InterviewCalendarPanel() {
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Current week
  const [interviews] = useState<Interview[]>(mockInterviews);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = generateWeekDays(currentWeek);

  const handleNavigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(navigateWeek(currentWeek, direction));
  };

  const getTimeSlotPosition = (time: string): number => {
    const timeMap: { [key: string]: number } = {
      "12:00 AM": 0, "1:00 AM": 1, "2:00 AM": 2, "3:00 AM": 3, "4:00 AM": 4, "5:00 AM": 5,
      "6:00 AM": 6, "7:00 AM": 7, "8:00 AM": 8, "9:00 AM": 9, "10:00 AM": 10, "11:00 AM": 11,
      "12:00 PM": 12, "1:00 PM": 13, "2:00 PM": 14, "3:00 PM": 15, "4:00 PM": 16, "5:00 PM": 17,
      "6:00 PM": 18, "7:00 PM": 19, "8:00 PM": 20, "9:00 PM": 21, "10:00 PM": 22, "11:00 PM": 23
    };
    return timeMap[time] || 0;
  };

  const getInterviewsForDay = (date: Date): Interview[] => {
    return interviews.filter(interview => isSameDay(interview.date, date));
  };

  const isPastDay = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    return isBefore(checkDate, today);
  };

  const getColorTagClass = (color?: string): string => {
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
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-400 dark:border-yellow-700/50 text-yellow-900 dark:text-yellow-300";
      case "indigo":
        return "bg-indigo-100 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700/50 text-indigo-900 dark:text-indigo-300";
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

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-title font-semibold text-light-text dark:text-dark-text mb-2">
            Interview Calendar
          </h3>
          {/* Expert Color Legend */}
          {/* <div className="flex gap-3 overflow-x-auto min-w-0 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {interviews.map((interview, idx) => (
              <div key={idx} className="flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getExpertColorDot(interview.colorTag || "gray")}`}></div>
                <span className="truncate">{interview.expertName}</span>
              </div>
            ))}
          </div> */}
        </div>
        <div className="flex items-center gap-2">
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
                const _isOccupied = dayInterviews.some(interview => {
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
                    } ${isPast ? 'bg-gray-100 dark:bg-gray-900 opacity-40' : ''}`}
                  >
                    {slotInterviews.map((interview) => {
                      const slotHeight = (interview.duration / 60) * 60;
                      
                      return (
                        <div
                          key={interview.id}
                          className={`absolute text-xs border-2 ${getColorTagClass(interview.colorTag)} group rounded`}
                          style={{
                            height: `${slotHeight}px`,
                            zIndex: 10
                          }}
                        >
                          <div className="p-2 h-full flex flex-col">
                            <div className="break-words">
                              <div className="font-semibold">{interview.expertName}</div>
                              <div className="text-xs mt-1">
                                {interview.time} - {interview.endTime}
                              </div>
                            </div>
                            
                            {/* Tooltip for team members */}
                            {interview.teamMembers && interview.teamMembers.length > 0 && (
                              <div className="absolute left-full ml-2 top-0 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                <div className="font-semibold mb-1">Team Members:</div>
                                {interview.teamMembers.map((member, idx) => (
                                  <div key={idx}>• {member}</div>
                                ))}
                                <div className="absolute right-full top-2 -mr-1 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                              </div>
                            )}
                          </div>
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
    </div>
  );
}