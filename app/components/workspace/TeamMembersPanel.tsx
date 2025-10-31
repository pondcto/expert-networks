"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useCampaign } from "../../lib/campaign-context";

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  avatar: string;
}

export interface TeamMembersPanelProps {
  members?: TeamMember[];
  onInviteMore?: () => void;
  onDataChange?: (data: TeamMember[]) => void;
}

const mockTeamMembers: TeamMember[] = [
  
];

const availableMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Robert",
    designation: "Research Lead",
    avatar: "/images/avatar/John Robert.png",
  },
  {
    id: "2",
    name: "Michael David",
    designation: "Data Analyst",
    avatar: "/images/avatar/Michael David.png",
  },
  {
    id: "3",
    name: "David Charles",
    designation: "Content Specialist",
    avatar: "/images/avatar/David Charles.png",
  },
  {
    id: "4",
    name: "Christopher Mark",
    designation: "Senior Researcher",
    avatar: "/images/avatar/Christopher Mark.png",
  },
  {
    id: "5",
    name: "Daniel Paul",
    designation: "Project Manager",
    avatar: "/images/avatar/Daniel Paul.png",
  },
  {
    id: "6",
    name: "James William",
    designation: "Technical Writer",
    avatar: "/images/avatar/James William.png",
  },
  {
    id: "7",
    name: "Matthew Scott",
    designation: "Quality Analyst",
    avatar: "/images/avatar/Matthew Scott.png",
  },
  {
    id: "8",
    name: "Richard Alan",
    designation: "Business Analyst",
    avatar: "/images/avatar/Richard Alan.png",
  },
  {
    id: "9",
    name: "Robert James",
    designation: "UX Researcher",
    avatar: "/images/avatar/Robert James.png",
  },
  {
    id: "10",
    name: "Thomas Edward",
    designation: "Market Analyst",
    avatar: "/images/avatar/Thomas Edward.png",
  },
];

export default function TeamMembersPanel({
  members = mockTeamMembers,
  onInviteMore,
  onDataChange,
}: TeamMembersPanelProps) {
  const { campaignData, saveCampaign, isNewCampaign } = useCampaign();
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [currentMembers, setCurrentMembers] = useState<TeamMember[]>(members);
  const [invitedMembers, setInvitedMembers] = useState<Set<string>>(new Set());
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);

  // Load campaign data when campaign changes
  useEffect(() => {
    if (isNewCampaign) {
      // Reset to empty for new campaigns
      if (currentCampaignId !== null) {
        setCurrentCampaignId(null);
        setCurrentMembers([]);
        setInvitedMembers(new Set());
      }
    } else if (campaignData?.id) {
      // If campaign ID changed, reset and load new campaign's team members
      if (currentCampaignId !== campaignData.id) {
        setCurrentCampaignId(campaignData.id);
        setCurrentMembers((campaignData.teamMembers as TeamMember[]) || []);
        setInvitedMembers(new Set());
      }
    }
  }, [campaignData, currentCampaignId, isNewCampaign]);

  const filteredMembers = availableMembers.filter(member =>
    (member.name.toLowerCase().includes(filterText.toLowerCase()) ||
    member.designation.toLowerCase().includes(filterText.toLowerCase())) &&
    !currentMembers.some(currentMember => currentMember.id === member.id)
  );

  const handleInviteMore = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFilterText("");
  };

  const handleInviteMember = async (member: TeamMember) => {
    // Add the member to the current team members list
    const newMembers = [...currentMembers, member];
    console.log('TeamMembers data change:', newMembers);
    setCurrentMembers(newMembers);
    
    // Mark as invited for visual feedback
    setInvitedMembers(prev => new Set(prev).add(member.id));
    
    // Notify parent of data change
    onDataChange?.(newMembers);
    
    // Auto-save after adding member - pass the new data directly
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after adding team member...');
        await saveCampaign({ teamMembers: newMembers });
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
    
    // Optional: Call the onInviteMore callback if provided
    if (onInviteMore) {
      onInviteMore();
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const newMembers = currentMembers.filter(member => member.id !== memberId);
    console.log('TeamMembers data change (delete):', newMembers);
    setCurrentMembers(newMembers);
    
    // Remove from invited members set so they can be re-invited
    setInvitedMembers(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
    
    // Notify parent of data change
    onDataChange?.(newMembers);
    
    // Auto-save after removing member - pass the new data directly
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after removing team member...');
        await saveCampaign({ teamMembers: newMembers });
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
  };

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
            Team Members
          </h3>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-1">
          <div className="space-y-2">
            {currentMembers.map((member) => (
              <div key={member.id} className="group relative flex items-center gap-3 dark:hover:bg-dark-background-secondary rounded transition-colors">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className=" font-medium text-light-text dark:text-dark-text truncate">
                    {member.name}
                  </div>
                  <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                    {member.designation}
                  </div>
                </div>
                {/* Delete button - appears on hover */}
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Invite more members */}
            <button
              onClick={handleInviteMore}
              className="flex items-center gap-3 py-1 w-full rounded transition-colors"
            >
              <div className="w-8 h-8 rounded bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border flex items-center justify-center">
                <Plus className="w-4 h-4 text-light-text dark:text-dark-text" />
              </div>
              <span className=" text-light-text dark:text-dark-text">
                Invite more members
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Members Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
                Team Members
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded transition-colors"
              >
                <X className="w-5 h-5 text-light-text dark:text-dark-text" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="p-4 border-b border-light-border dark:border-dark-border">
              <input
                type="text"
                placeholder="Filter team members..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full px-2 py-1 bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded-md text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-auto p-2">
              <div>
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded transition-colors">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-light-text dark:text-dark-text truncate">
                        {member.name}
                      </div>
                      <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                        {member.designation}
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteMember(member)}
                      disabled={invitedMembers.has(member.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        invitedMembers.has(member.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-primary-500 hover:bg-primary-600 text-white"
                      }`}
                    >
                      {invitedMembers.has(member.id) ? "Invited" : "Invite"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
