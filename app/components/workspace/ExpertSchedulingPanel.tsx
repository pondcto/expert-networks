"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProposedExpert } from "../../data/mockData";
import { useCampaign } from "../../lib/campaign-context";
import { 
  timeSlots, 
  daysOfWeek, 
  generateWeekDays, 
  format, 
  startOfWeek,
  isSameDay, 
  isToday,
  parseISO,
  startOfDay,
  isBefore
} from "../../utils/dateUtils";
import { Check, Users, X, Send } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CampaignData } from "../../lib/campaign-context";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

interface ExpertSchedulingPanelProps {
  selectedExpert?: ProposedExpert | null;
}

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  avatar: string;
}

interface ExtendedCampaignData extends CampaignData {
  id?: string;
  completedCalls?: number;
  scheduledCalls?: number;
}

// Draggable Team Member Component
function DraggableTeamMember({ member, isRequired }: { member: TeamMember; isRequired: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { member, isRequired },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <img
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          src={member.avatar}
          alt={member.name}
          className={`w-8 h-8 rounded-full border-2 object-cover transition-all ${
            isDragging
              ? 'cursor-grabbing opacity-50'
              : 'cursor-grab'
          } ${
            isRequired
              ? 'border-primary-400 dark:border-primary-600 opacity-50'
              : 'border-light-background dark:border-dark-background hover:border-primary-300 dark:hover:border-primary-700 hover:scale-110'
          }`}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 dark:bg-gray-800 text-white border border-gray-700">
        <p className="text-sm">{member.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Droppable Section Component
function DroppableSection({ 
  id, 
  children, 
  className 
}: { 
  id: string; 
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ''} ${isOver ? 'ring-2 ring-primary-500 ring-offset-2 bg-primary-50 dark:bg-primary-900/20' : ''}`}
    >
      {children}
    </div>
  );
}

export default function ExpertSchedulingPanel({ selectedExpert }: ExpertSchedulingPanelProps) {
  const { campaignData } = useCampaign();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // Format: "YYYY-MM-DD_HH:MM"
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [requiredMemberIds, setRequiredMemberIds] = useState<string[]>([]);
  const [timeZone, setTimeZone] = useState<string>("UTC");
  const [timeZones, setTimeZones] = useState<string[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekDays = generateWeekDays(currentWeek);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });

  // Load team members from campaign
  useEffect(() => {
    if (campaignData?.teamMembers) {
      setTeamMembers(campaignData.teamMembers as TeamMember[]);
      // Load required members from localStorage (per campaign)
      const extendedCampaign = campaignData as ExtendedCampaignData;
      const cid = extendedCampaign?.id;
      const saved = cid ? localStorage.getItem(`required_members_${cid}`) : null;
      if (saved) {
        try { setRequiredMemberIds(JSON.parse(saved)); } catch {}
      } else {
        setRequiredMemberIds([]); // all optional by default
      }
      // Load saved timezone or default to system
      const savedTz = cid ? localStorage.getItem(`timezone_${cid}`) : null;
      const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimeZone(savedTz || systemTz);
    }
  }, [campaignData]);

  // Populate all available time zones (IANA)
  useEffect(() => {
    try {
      const intlWithSupportedValuesOf = Intl as typeof Intl & { supportedValuesOf?: (type: string) => string[] };
      const zones: string[] = typeof intlWithSupportedValuesOf.supportedValuesOf === 'function'
        ? intlWithSupportedValuesOf.supportedValuesOf('timeZone')
        : [
            'UTC','Etc/GMT+12','Pacific/Midway','Pacific/Honolulu','America/Anchorage','America/Los_Angeles',
            'America/Denver','America/Chicago','America/New_York','America/Sao_Paulo','Atlantic/Azores',
            'Europe/London','Europe/Paris','Europe/Berlin','Europe/Athens','Africa/Cairo','Europe/Moscow',
            'Asia/Dubai','Asia/Karachi','Asia/Kolkata','Asia/Dhaka','Asia/Bangkok','Asia/Shanghai',
            'Asia/Tokyo','Australia/Sydney','Pacific/Auckland'
          ];
      setTimeZones(zones.slice().sort((a,b) => a.localeCompare(b)));
    } catch {
      setTimeZones(['UTC']);
    }
  }, []);

  // Reset state when expert changes
  useEffect(() => {
    // Clear selected time slots when a different expert is selected
    setSelectedSlots([]);
    setShowRequestModal(false);
    // Reset to current week
    setCurrentWeek(new Date());
  }, [selectedExpert?.id]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end - move member between sections
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!activeId.startsWith('member-')) return;

    const memberId = activeId.replace('member-', '');
    const extendedCampaign = campaignData as ExtendedCampaignData;
    const cid = extendedCampaign?.id;

    if (overId === 'required-attendees') {
      // Move to required attendees
      if (!requiredMemberIds.includes(memberId)) {
        const next = [...requiredMemberIds, memberId];
        setRequiredMemberIds(next);
        if (cid) localStorage.setItem(`required_members_${cid}`, JSON.stringify(next));
      }
    } else if (overId === 'team-members') {
      // Move to team members (remove from required)
      if (requiredMemberIds.includes(memberId)) {
        const next = requiredMemberIds.filter(x => x !== memberId);
        setRequiredMemberIds(next);
        if (cid) localStorage.setItem(`required_members_${cid}`, JSON.stringify(next));
      }
    }
  };

  // Get active member for drag overlay
  const getActiveMember = () => {
    if (!activeId || !activeId.startsWith('member-')) return null;
    const memberId = activeId.replace('member-', '');
    return teamMembers.find(m => m.id === memberId) || null;
  };

  const isPastDay = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    return isBefore(checkDate, today);
  };

  const handleNavigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  // Mock expert availability (in a real app, this would come from the API)
  const getExpertAvailability = (date: Date, timeSlot: string): boolean => {
    if (!selectedExpert) return false;
    
    // For demo: expert is available on weekdays 9am-5pm
    const dayOfWeek = date.getDay();
    const hour = parseInt(timeSlot.split(':')[0]);
    const isPM = timeSlot.includes('pm');
    const hour24 = hour === 12 ? (isPM ? 12 : 0) : (isPM ? hour + 12 : hour);
    
    // Available Monday-Friday, 9am-5pm
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour24 >= 9 && hour24 < 17;
  };

  // Mock team availability (in a real app, this would come from team calendars)
  const getTeamAvailability = (date: Date, timeSlot: string): boolean => {
    const required = teamMembers.filter(m => requiredMemberIds.includes(m.id));
    if (required.length === 0) return true; // If no required attendees, treat as unconstrained
    
    // For demo: team is available on weekdays 10am-4pm
    const dayOfWeek = date.getDay();
    const hour = parseInt(timeSlot.split(':')[0]);
    const isPM = timeSlot.includes('pm');
    const hour24 = hour === 12 ? (isPM ? 12 : 0) : (isPM ? hour + 12 : hour);
    
    // Available Monday-Friday, 10am-4pm (slightly narrower than expert for realistic overlap)
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour24 >= 10 && hour24 < 16;
  };

  // Check if both expert and team are available (overlapping availability)
  const hasOverlappingAvailability = (date: Date, timeSlot: string): boolean => {
    return getExpertAvailability(date, timeSlot) && getTeamAvailability(date, timeSlot);
  };

  // Create unique slot ID
  const getSlotId = (date: Date, timeSlot: string): string => {
    return `${format(date, "yyyy-MM-dd")}_${timeSlot}`;
  };

  // Toggle slot selection
  const toggleSlotSelection = (date: Date, timeSlot: string) => {
    if (isPastDay(date)) return;
    if (!hasOverlappingAvailability(date, timeSlot)) return;

    const slotId = getSlotId(date, timeSlot);
    setSelectedSlots(prev => 
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  // Check if a slot is selected
  const isSlotSelected = (date: Date, timeSlot: string): boolean => {
    const slotId = getSlotId(date, timeSlot);
    return selectedSlots.includes(slotId);
  };

  // Handle request time slots
  const handleRequestTimeSlots = () => {
    if (selectedSlots.length === 0) {
      return;
    }
    setShowRequestModal(true);
  };

  // Handle confirm request
  const handleConfirmRequest = () => {
    console.log("Requesting time slots:", selectedSlots);
    console.log("Selected expert:", selectedExpert?.name);
    console.log("Team members:", teamMembers.map(m => m.name).join(', '));
    
    // In a real app, this would make an API call and move to scheduling pipeline
    // For now, just close the modal and reset selections
    setShowRequestModal(false);
    setSelectedSlots([]);
    
    // Show success feedback (could be a toast notification in a real app)
    alert("Time slot request sent successfully! The network will coordinate with the expert and send calendar invites.");
  };

  // Format selected slots for display
  const getFormattedSlots = () => {
    return selectedSlots.map(slotId => {
      const [dateStr, time] = slotId.split('_');
      const date = new Date(dateStr);
      return {
        date: format(date, "EEE, MMM d, yyyy"),
        time: time
      };
    });
  };

  if (!selectedExpert) {
    return (
      <div className="card h-full w-full flex flex-col items-center justify-center p-8">
        <Users className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
          No Expert Selected
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
          Please select an expert from the Proposed Experts panel to view their availability and schedule a call.
        </p>
      </div>
    );
  }

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text mb-1">
          Expert Availability / Scheduling
        </h3>
        <button
          onClick={handleRequestTimeSlots}
          disabled={selectedSlots.length === 0}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            selectedSlots.length === 0
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          Request Time Slots
        </button>
      </div>

      {/* Expert and Team Info */}
      <div className="flex items-center justify-between mb-3 p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          {/* Expert Info */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image src={selectedExpert.avatar} alt={selectedExpert.name} width={40} height={40} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-light-text dark:text-dark-text">{selectedExpert.name}</span>
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{selectedExpert.title}</span>
            </div>
          </div>          
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleNavigateWeek("prev")}
            className="px-3 py-1.5 text-sm border border-light-border dark:border-dark-border rounded hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            ← Prev Week
          </button>
          <div className="px-3 py-1.5 text-sm font-medium text-light-text dark:text-dark-text">
            Week of {format(weekStart, "MMM d, yyyy")}
          </div>
          <button 
            onClick={() => handleNavigateWeek("next")}
            className="px-3 py-1.5 text-sm border border-light-border dark:border-dark-border rounded hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            Next Week →
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex items-center gap-3 mb-3">
          {/* Team Members Section */}
          {teamMembers.length > 0 && (
            <DroppableSection 
              id="team-members" 
              className="mb-3 w-1/2 flex-1"
            >
              <div className="p-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded">
                <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Team Members
                </div>
                <div className="flex items-center min-h-[40px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex -space-x-2">
                      {teamMembers
                        .filter(member => !requiredMemberIds.includes(member.id))
                        .map((member) => (
                          <DraggableTeamMember
                            key={member.id}
                            member={member}
                            isRequired={false}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </DroppableSection>
          )}
          {/* Required Attendees Section */}
          {teamMembers.length > 0 && (
            <DroppableSection 
              id="required-attendees" 
              className="mb-3 w-1/2 flex-1"
            >
              <div className="p-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded">
                <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Required attendees
                </div>
                <div className="flex items-center min-h-[40px]">
                  {requiredMemberIds.length === 0 ? (
                    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary italic">
                      Drag team members here
                    </div>
                  ) : (
                    <div className="flex -space-x-2">
                      {teamMembers
                        .filter(m => requiredMemberIds.includes(m.id))
                        .map(m => (
                          <DraggableTeamMember
                            key={m.id}
                            member={m}
                            isRequired={true}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </DroppableSection>
          )}
        </div>
        <DragOverlay>
          {activeId && (() => {
            const activeMember = getActiveMember();
            if (!activeMember) return null;
            return (
              <img
                src={activeMember.avatar}
                alt={activeMember.name}
                className="w-8 h-8 rounded-full border-2 border-primary-400 dark:border-primary-600 object-cover opacity-75"
              />
            );
          })()}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700"></div>
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Expert Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700"></div>
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Team Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 dark:border-purple-600"></div>
          <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Both Available (Click to Select)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary-500 border-2 border-primary-600"></div>
          <span className="text-light-text-secondary dark:text-dark-text-secondary font-semibold">Selected</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-0 border border-light-border dark:border-dark-border rounded-lg">
          {/* Time column header */}
          <div className="sticky top-0 p-2 text-body-md font-medium text-light-text-secondary dark:text-dark-text-secondary border-r border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface z-20">
            <select
              value={timeZone}
              onChange={(e) => {
                const tz = e.target.value;
                setTimeZone(tz);
                const extendedCampaign = campaignData as ExtendedCampaignData;
                const cid = extendedCampaign?.id;
                if (cid) localStorage.setItem(`timezone_${cid}`, tz);
              }}
              className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-white dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {timeZones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
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

          {/* Time slots and availability grid */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <React.Fragment key={timeIndex}>
              {/* Time label */}
              <div className="p-2 text-sm text-light-text-secondary dark:text-dark-text-secondary border-r border-t border-light-border dark:border-dark-border">
                {timeSlot}
              </div>
              
              {/* Day columns */}
              {weekDays.slice(0, 7).map((day, dayIndex) => {
                const isPast = isPastDay(day);
                const expertAvailable = getExpertAvailability(day, timeSlot);
                const teamAvailable = getTeamAvailability(day, timeSlot);
                const bothAvailable = hasOverlappingAvailability(day, timeSlot);
                const isSelected = isSlotSelected(day, timeSlot);
                
                let cellClass = "p-1 min-h-[40px] border-r border-t border-light-border dark:border-dark-border last:border-r-0 relative ";
                
                if (isPast) {
                  cellClass += "bg-gray-50 dark:bg-gray-900/20 cursor-not-allowed opacity-40";
                } else if (isSelected) {
                  cellClass += "bg-primary-500 cursor-pointer hover:bg-primary-600";
                } else if (bothAvailable) {
                  cellClass += "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50";
                } else if (expertAvailable && !teamAvailable) {
                  cellClass += "bg-green-50 dark:bg-green-900/20 cursor-not-allowed";
                } else if (!expertAvailable && teamAvailable) {
                  cellClass += "bg-blue-50 dark:bg-blue-900/20 cursor-not-allowed";
                } else {
                  cellClass += "bg-white dark:bg-dark-background cursor-not-allowed";
                }
                
                return (
                  <div
                    key={dayIndex}
                    className={cellClass}
                    onClick={() => toggleSlotSelection(day, timeSlot)}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                            </div>
                    )}
                    {bothAvailable && !isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Click</span>
                            </div>
                          )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Request Confirmation Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden border border-light-border dark:border-dark-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                    Request Expert Consultation
                  </h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    Review details before sending to network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
              >
                <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Expert Card */}
                <div className="col-span-1 p-2 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      <Image src={selectedExpert.avatar} alt={selectedExpert.name} width={48} height={48} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary font-medium mb-0.5">EXPERT</p>
                      <p className="font-semibold text-sm text-light-text dark:text-dark-text truncate">{selectedExpert.name}</p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{selectedExpert.title}</p>
                    </div>
                  </div>
                </div>

                {/* Team Summary Card */}
                <div className="col-span-1 p-2 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 flex-shrink-0">
                      {(() => {
                        const requiredMembers = teamMembers.filter(m => requiredMemberIds.includes(m.id));
                        const displayMembers = requiredMemberIds.length > 0 ? requiredMembers : teamMembers;
                        return (
                          <>
                            {displayMembers.slice(0, 3).map((member) => (
                              <img
                                key={member.id}
                                src={member.avatar}
                                alt={member.name}
                                className="w-10 h-10 rounded-full border-2 border-light-surface dark:border-dark-surface object-cover"
                                title={member.name}
                              />
                            ))}
                            {displayMembers.length > 3 && (
                              <div className="w-10 h-10 rounded-full border-2 border-light-surface dark:border-dark-surface bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">+{displayMembers.length - 3}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary font-medium mb-0.5">TEAM MEMBERS</p>
                      <p className="font-semibold text-sm text-light-text dark:text-dark-text">
                        {(() => {
                          const requiredCount = requiredMemberIds.length;
                          const totalCount = teamMembers.length;
                          if (requiredCount > 0) {
                            return `${requiredCount} required${requiredCount < totalCount ? ` / ${totalCount} total` : ''}`;
                          }
                          return `${totalCount} ${totalCount === 1 ? 'member' : 'members'}`;
                        })()}
                      </p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
                        {(() => {
                          const requiredMembers = teamMembers.filter(m => requiredMemberIds.includes(m.id));
                          const displayMembers = requiredMemberIds.length > 0 ? requiredMembers : teamMembers;
                          return displayMembers.slice(0, 2).map(m => m.name).join(', ') + (displayMembers.length > 2 ? '...' : '');
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Time Slots - Compact View */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">
                    Preferred Time Slots
                  </h4>
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                    {selectedSlots.length} selected
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {getFormattedSlots().map((slot, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-md flex-shrink-0"
                      >
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">
                          {slot.date}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 whitespace-nowrap">
                          {slot.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Members - Compact View (Only Required Members) */}
              {teamMembers.length > 0 && requiredMemberIds.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide mb-2">
                    Invitations Will Be Sent To
                  </h4>
                  <div className="p-3 bg-light-background dark:bg-dark-background rounded-lg border border-light-border dark:border-dark-border">
                    <div className="flex flex-wrap gap-2 min-w-0">
                      {teamMembers.filter(member => requiredMemberIds.includes(member.id)).map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center gap-2 px-2 py-1 bg-light-surface dark:bg-dark-surface rounded border border-light-border dark:border-dark-border flex-shrink-0"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-xs font-medium text-light-text dark:text-dark-text whitespace-nowrap">
                            {member.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Message */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  <Users className="w-3.5 h-3.5 inline mr-1.5" />
                  The expert network will coordinate with <strong>{selectedExpert.name}</strong> and send calendar invites to {requiredMemberIds.length > 0 ? 'required team members' : 'all team members'} once a time slot is confirmed.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background">
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Request will be sent to expert network
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-sm font-medium text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover rounded-md transition-colors"
                >
                  Cancel
                </button>
          <button
                  onClick={handleConfirmRequest}
                  className="px-5 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Request
          </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
