"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset } from "./components/ui/sidebar";
import Logo from "./components/Logo";
import { useTheme } from "./providers/theme-provider";
import UserMenu from "./components/UserMenu";
import NewProjectModal from "./components/NewProjectModal";
import { Sun, Moon, Users, Calendar, FolderOpen, Plus, DollarSign, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Campaign {
  id: string;
  campaignName: string;
  projectCode: string;
  industryVertical: string;
  startDate: string;
  targetCompletionDate: string;
  estimatedCalls: number;
  teamMembers: { id: string; name: string; designation: string; avatar: string }[];
  createdAt: string;
  updatedAt: string;
  order?: number;
}

interface ProjectGroup {
  projectCode: string;
  projectName: string;
  campaigns: Campaign[];
  totalCalls: number;
  totalBudget: number;
  totalSpent: number;
  isRealProject: boolean; // Whether this is an actual saved project or just a grouping
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  itemName,
  itemType = "Campaign",
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  itemName: string;
  itemType?: "Campaign" | "Project";
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const defaultMessage = itemType === "Project"
    ? `Are you sure you want to delete the project "${itemName}"? All campaigns in this project will be moved to "Other Campaigns". This action cannot be undone.`
    : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div 
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
          Delete {itemType}
        </h3>
        <p className="text-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
          {message || defaultMessage}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-body font-medium text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-body font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Project Section Component
function DroppableProjectSection({
  projectCode,
  isExpanded,
  children,
}: {
  projectCode: string;
  isExpanded: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: projectCode,
  });

  return (
    <div
      ref={isExpanded ? setNodeRef : undefined}
      className={`${
        isOver && isExpanded ? "ring-2 ring-primary-500 ring-offset-2" : ""
      } transition-all`}
    >
      {children}
    </div>
  );
}

// Draggable Campaign Card Row Component (for column layout)
function DraggableCampaignCardRow({
  campaign,
  projectCode,
  onDelete,
  onNavigate,
}: {
  campaign: Campaign;
  projectCode: string;
  onDelete: (e: React.MouseEvent, campaignId: string) => void;
  onNavigate: (campaignId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campaign.id, data: { campaign, projectCode } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate campaign status based on dates
  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.targetCompletionDate);

    if (now < start) {
      return { label: "Waiting", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300", isActive: false };
    } else if (now >= start && now <= end) {
      return { label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", isActive: true };
    } else {
      return { label: "Completed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300", isActive: false };
    }
  };

  // Calculate progress percentage for active campaigns
  const calculateProgress = (campaign: Campaign): number => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.targetCompletionDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const status = getCampaignStatus(campaign);
  const progress = status.isActive ? calculateProgress(campaign) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg p-3 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-grab active:cursor-grabbing"
      {...attributes} 
      {...listeners}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(e, campaign.id);
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(campaign.id);
          }}
        >
          <h4 className="font-medium text-sm text-light-text dark:text-dark-text truncate">
            {campaign.campaignName}
          </h4>
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary truncate">
            {campaign.industryVertical}
          </p>
        </div>
      </div>

      {/* Status Badge or Progress */}
      {status.isActive ? (
        <div 
          className="mb-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(campaign.id);
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Active
            </span>
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div 
          className="mb-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(campaign.id);
          }}
        >
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      )}

      {/* Campaign Details */}
      <div 
        className="space-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(campaign.id);
        }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Timeline
          </span>
          <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
            {campaign.startDate !== "Any" ? new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated Calls</span>
          <span className="font-medium text-light-text dark:text-dark-text">{campaign.estimatedCalls}</span>
        </div>
        {campaign.teamMembers && campaign.teamMembers.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Team
            </span>
            <div className="flex -space-x-1">
              {campaign.teamMembers.slice(0, 3).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-5 h-5 rounded-full border border-light-surface dark:border-dark-surface object-cover"
                  title={member.name}
                />
              ))}
              {campaign.teamMembers.length > 3 && (
                <div className="w-5 h-5 rounded-full border border-light-surface dark:border-dark-surface bg-light-background-secondary dark:bg-dark-background-secondary flex items-center justify-center text-[10px] font-medium text-light-text dark:text-dark-text">
                  +{campaign.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeContent() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Project delete modal state
  const [isProjectDeleteModalOpen, setIsProjectDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ code: string; name: string } | null>(null);
  
  // New project modal state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Project column widths (array of percentages that should sum to 100)
  const [projectWidths, setProjectWidths] = useState<number[]>([]);
  const [draggingDividerIndex, setDraggingDividerIndex] = useState<number | null>(null);
  
  // Memoize grouped projects to ensure consistency
  const [groupedProjects, setGroupedProjects] = useState<ProjectGroup[]>([]);

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    })
  );

  // Load campaigns from localStorage
  useEffect(() => {
    const loadCampaigns = () => {
      const allCampaigns: Campaign[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("campaign_")) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              allCampaigns.push(JSON.parse(data));
            }
          } catch (error) {
            console.error("Error parsing campaign data:", error);
          }
        }
      }
      // Sort by most recent first
      allCampaigns.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - 
        new Date(a.updatedAt || a.createdAt).getTime()
      );
      
      // Initialize order field for campaigns that don't have it
      // Group by project and assign order within each project
      const projectGroups = new Map<string, Campaign[]>();
      allCampaigns.forEach(campaign => {
        const projectCode = campaign.projectCode || '';
        if (!projectGroups.has(projectCode)) {
          projectGroups.set(projectCode, []);
        }
        projectGroups.get(projectCode)!.push(campaign);
      });
      
      // Assign order within each project group
      projectGroups.forEach((campaigns) => {
        campaigns.forEach((campaign, index) => {
          if (campaign.order === undefined) {
            campaign.order = index;
            localStorage.setItem(`campaign_${campaign.id}`, JSON.stringify(campaign));
          }
        });
      });
      
      setCampaigns(allCampaigns);
    };

    loadCampaigns();

    // Listen for campaign and project updates
    const handleCampaignSaved = () => {
      loadCampaigns();
    };
    const handleProjectSaved = () => {
      loadCampaigns(); // Reload to refresh display
    };
    
    window.addEventListener("campaignSaved", handleCampaignSaved);
    window.addEventListener("projectSaved", handleProjectSaved);
    return () => {
      window.removeEventListener("campaignSaved", handleCampaignSaved);
      window.removeEventListener("projectSaved", handleProjectSaved);
    };
  }, []);

  // Update grouped projects and initialize widths when campaigns change
  useEffect(() => {
    const projects = groupCampaignsByProject();
    setGroupedProjects(projects);
    
    if (projects.length > 0) {
      // Only update if the number of projects changed
      if (projectWidths.length !== projects.length) {
        // All projects are expanded with 15vw each
        const widths: number[] = projects.map(() => 15);
        setProjectWidths(widths);
      }
    } else {
      // No projects, clear widths
      setProjectWidths([]);
    }
  }, [campaigns]);

  // Divider dragging logic
  const onMouseDownDivider = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingDividerIndex(index);
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (draggingDividerIndex === null || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Calculate position as percentage of viewport width (since we use vw)
      const xVw = (x / window.innerWidth) * 100;
      
      // Calculate cumulative width of all projects before this divider
      let cumulativeVw = 0;
      for (let i = 0; i < draggingDividerIndex; i++) {
        cumulativeVw += projectWidths[i];
      }
      
      // Calculate the new width for the project at draggingDividerIndex
      const newWidth = Math.max(2, xVw - cumulativeVw); // Minimum 2vw
      
      // Update only the left column width
      const newWidths = [...projectWidths];
      newWidths[draggingDividerIndex] = newWidth;
      setProjectWidths(newWidths);
    }
    
    function onUp() {
      if (draggingDividerIndex !== null) {
        // When mouse is released, snap collapsed cards to 2vw
        const newWidths = projectWidths.map(width => {
          // If width is less than 5vw (collapsed threshold), snap to 2vw
          if (width < 5 && width !== 2) {
            return 2;
          }
          return width;
        });
        
        // Only update if there's a change
        if (JSON.stringify(newWidths) !== JSON.stringify(projectWidths)) {
          setProjectWidths(newWidths);
        }
        
        setDraggingDividerIndex(null);
      }
    }
    
    if (draggingDividerIndex !== null) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    }
  }, [draggingDividerIndex, projectWidths]);

  // Calculate campaign status based on dates
  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.targetCompletionDate);

    if (now < start) {
      return { label: "Waiting for vendors", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300", isActive: false };
    } else if (now >= start && now <= end) {
      return { label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", isActive: true };
    } else {
      return { label: "Completed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300", isActive: false };
    }
  };

  // Calculate progress percentage for active campaigns
  const calculateProgress = (campaign: Campaign): number => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.targetCompletionDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const draggedCampaignId = active.id as string;
    const overItemId = over.id as string;

    // Find the dragged campaign
    const draggedCampaign = campaigns.find(c => c.id === draggedCampaignId);
    if (!draggedCampaign) return;

    // Check if we're dropping over another campaign
    const overCampaign = campaigns.find(c => c.id === overItemId);
    
    if (overCampaign) {
      // Check if it's the same project (reordering) or different project (moving)
      if (draggedCampaign.projectCode === overCampaign.projectCode) {
        // Reordering within the same project
        // Get all campaigns in this project
        const projectCampaigns = campaigns.filter(c => c.projectCode === draggedCampaign.projectCode);
        
        // Sort by order or original position
        projectCampaigns.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const oldIndex = projectCampaigns.findIndex(c => c.id === draggedCampaignId);
        const newIndex = projectCampaigns.findIndex(c => c.id === overItemId);
        
        if (oldIndex !== newIndex) {
          // Reorder the campaigns
          const reorderedCampaigns = arrayMove(projectCampaigns, oldIndex, newIndex);
          
          // Update order field for all campaigns in this project
          reorderedCampaigns.forEach((campaign, index) => {
            campaign.order = index;
            campaign.updatedAt = new Date().toISOString();
            localStorage.setItem(`campaign_${campaign.id}`, JSON.stringify(campaign));
          });
          
          // Update state
          const updatedAllCampaigns = campaigns.map(c => {
            const reordered = reorderedCampaigns.find(rc => rc.id === c.id);
            return reordered || c;
          });
          
          setCampaigns(updatedAllCampaigns);
          
          // Dispatch event to update sidebar
          window.dispatchEvent(new CustomEvent('campaignSaved'));
        }
        return; // Done with reordering
      } else {
        // Dropping on a campaign in a different project - move to that project
        const targetProjectCode = overCampaign.projectCode;
        
        // Update the campaign's projectCode
        const updatedCampaign = {
          ...draggedCampaign,
          projectCode: targetProjectCode,
          updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem(`campaign_${draggedCampaignId}`, JSON.stringify(updatedCampaign));

        // Update state
        setCampaigns(prev => prev.map(c => c.id === draggedCampaignId ? updatedCampaign : c));

        // Dispatch event to update sidebar
        window.dispatchEvent(new CustomEvent('campaignSaved'));
        return; // Done with moving
      }
    }

    // If we get here, we're dropping over a project droppable area (moving between projects)
    const targetProjectCode = overItemId;

    // If dropped on the same project (droppable area), do nothing
    if (draggedCampaign.projectCode === targetProjectCode) return;

    // Update the campaign's projectCode
    const updatedCampaign = {
      ...draggedCampaign,
      projectCode: targetProjectCode === "Other Campaigns" ? "" : targetProjectCode,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(`campaign_${draggedCampaignId}`, JSON.stringify(updatedCampaign));

    // Update state
    setCampaigns(prev => prev.map(c => c.id === draggedCampaignId ? updatedCampaign : c));

    // Dispatch event to update sidebar
    window.dispatchEvent(new CustomEvent('campaignSaved'));
  };

  // Delete campaign
  const handleDeleteCampaign = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setCampaignToDelete({ id: campaignId, name: campaign.campaignName });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteCampaign = () => {
    if (campaignToDelete) {
      localStorage.removeItem(`campaign_${campaignToDelete.id}`);
      setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('campaignSaved'));
      
      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  const cancelDeleteCampaign = () => {
    setIsDeleteModalOpen(false);
    setCampaignToDelete(null);
  };

  // Project deletion handlers
  const handleDeleteProject = (e: React.MouseEvent, projectCode: string, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setProjectToDelete({ code: projectCode, name: projectName });
    setIsProjectDeleteModalOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      // Remove project from localStorage
      localStorage.removeItem(`project_${projectToDelete.code}`);
      
      // Move all campaigns in this project to "Other Campaigns" by clearing their projectCode
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.projectCode === projectToDelete.code) {
          const updatedCampaign = {
            ...campaign,
            projectCode: "",
            updatedAt: new Date().toISOString()
          };
          // Update in localStorage
          localStorage.setItem(`campaign_${campaign.id}`, JSON.stringify(updatedCampaign));
          return updatedCampaign;
        }
        return campaign;
      });
      
      setCampaigns(updatedCampaigns);
      
      // Dispatch events to update sidebar and refresh
      window.dispatchEvent(new CustomEvent('projectSaved'));
      window.dispatchEvent(new CustomEvent('campaignSaved'));
      
      // Close modal and reset state
      setIsProjectDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const cancelDeleteProject = () => {
    setIsProjectDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // Handle new project creation
  const handleNewProject = (projectData: { projectName: string; projectCode: string }) => {
    const project = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem(`project_${project.projectCode}`, JSON.stringify(project));
    
    // Dispatch event to update sidebar and dashboard
    window.dispatchEvent(new CustomEvent('projectSaved'));
    
    // Close modal
    setIsNewProjectModalOpen(false);
  };

  // Get project info from localStorage
  const getProjectInfo = (projectCode: string): { projectName: string; isRealProject: boolean } => {
    try {
      const projectData = localStorage.getItem(`project_${projectCode}`);
      if (projectData) {
        const project = JSON.parse(projectData);
        return {
          projectName: project.projectName || projectCode,
          isRealProject: true
        };
      }
    } catch (error) {
      console.error("Error reading project data:", error);
    }
    return {
      projectName: projectCode === "Other Campaigns" ? "Other Campaigns" : projectCode,
      isRealProject: false
    };
  };

  // Group campaigns by project (including projects without campaigns)
  const groupCampaignsByProject = (): ProjectGroup[] => {
    const projectMap = new Map<string, Campaign[]>();
    
    // First, load all saved projects from localStorage
    const allProjects: Array<{ projectCode: string; projectName: string; createdAt: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        try {
          const projectData = JSON.parse(localStorage.getItem(key) || '{}');
          if (projectData.projectCode && projectData.projectName) {
            allProjects.push({
              projectCode: projectData.projectCode,
              projectName: projectData.projectName,
              createdAt: projectData.createdAt || new Date().toISOString()
            });
            // Initialize with empty campaign array
            projectMap.set(projectData.projectCode, []);
          }
        } catch (error) {
          console.error('Error parsing project data:', error);
        }
      }
    }
    
    // Separate campaigns with and without valid projects
    const campaignsWithoutProject: Campaign[] = [];

    campaigns.forEach(campaign => {
      const projectCode = campaign.projectCode || '';
      if (projectCode) {
        // Check if project exists
        if (projectMap.has(projectCode)) {
          projectMap.get(projectCode)!.push(campaign);
        } else {
          campaignsWithoutProject.push(campaign);
        }
      } else {
        campaignsWithoutProject.push(campaign);
      }
    });

    // Add "Other Campaigns" group if there are campaigns without projects
    if (campaignsWithoutProject.length > 0) {
      projectMap.set("Other Campaigns", campaignsWithoutProject);
    }

    return Array.from(projectMap.entries()).map(([projectCode, projectCampaigns]) => {
      const { projectName, isRealProject } = getProjectInfo(projectCode);
      const totalCalls = projectCampaigns.reduce((sum, c) => sum + (c.estimatedCalls || 0), 0);
      // Assume $1000 per call as average cost
      const avgCostPerCall = 1000;
      const totalBudget = totalCalls * avgCostPerCall;
      // Calculate spent based on progress of active campaigns
      const totalSpent = projectCampaigns.reduce((sum, c) => {
        const status = getCampaignStatus(c);
        if (status.isActive) {
          const progress = calculateProgress(c) / 100;
          return sum + (c.estimatedCalls * avgCostPerCall * progress);
        } else if (status.label === "Completed") {
          return sum + (c.estimatedCalls * avgCostPerCall);
        }
        return sum;
      }, 0);

      // Sort campaigns by order field
      const sortedCampaigns = projectCampaigns.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
        const orderB = b.order !== undefined ? b.order : 999999;
        return orderA - orderB;
      });

      return {
        projectCode,
        projectName,
        campaigns: sortedCampaigns,
        totalCalls,
        totalBudget,
        totalSpent,
        isRealProject
      };
    }).sort((a, b) => {
      // Sort "Other Campaigns" to the end
      if (a.projectCode === "Other Campaigns") return 1;
      if (b.projectCode === "Other Campaigns") return -1;
      
      // Use stable sort based on project creation date (not campaign dates)
      // This ensures project order doesn't change when campaigns are moved
      const aProject = allProjects.find(p => p.projectCode === a.projectCode);
      const bProject = allProjects.find(p => p.projectCode === b.projectCode);
      
      // Sort by project creation date (most recent projects first)
      return new Date(bProject?.createdAt || 0).getTime() - new Date(aProject?.createdAt || 0).getTime();
    });
  };


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="h-screen w-[100vw] flex flex-col bg-light-background dark:bg-dark-background overflow-x-hidden">
      {/* Windshift Ribbon */}
      <header className="w-full sticky top-0 z-50 shrink-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden max-w-full">
        <div className="w-full h-full px-2 pb-2 ml-[48px] overflow-y-auto overflow-x-hidden">

          {/* New Campaign Button*/}
          <div className="my-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/campaign/new")}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </button>

              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Projects and Campaigns List */}
          {campaigns.length === 0 ? (
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                No campaigns yet
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Get started by creating your first campaign
              </p>
              <button
                onClick={() => router.push("/campaign/new")}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          ) : projectWidths.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-light-text-secondary dark:text-dark-text-secondary">Loading projects...</div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex h-[calc(100vh-135px)] w-[100vw] overflow-x-auto overflow-y-hidden gap-px" style={{ maxWidth: 'calc(100vw - 48px - 1rem)' }} ref={containerRef}>
                {groupedProjects.map((project, projectIndex) => {
                  const costPercentage = project.totalBudget > 0 
                    ? Math.min(Math.round((project.totalSpent / project.totalBudget) * 100), 100)
                    : 0;
                  const campaignIds = project.campaigns.map(c => c.id);
                  const columnWidth = projectWidths[projectIndex] || 0;
                  const isCollapsed = columnWidth < 5;
                  
                  return (
                    <React.Fragment key={project.projectCode}>
                      {/* Project Card - Collapsed or Expanded based on width */}
                      {isCollapsed ? (
                        <button
                          className="h-full shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-card dark:shadow-card-dark hover:bg-light-background dark:hover:bg-dark-background transition-colors"
                          style={{ width: `${columnWidth}vw` }}
                          title={`Expand ${project.projectName} (${project.campaigns.length} campaigns)`}
                          onClick={() => {
                            const newWidths = [...projectWidths];
                            newWidths[projectIndex] = 15;
                            setProjectWidths(newWidths);
                          }}
                          onContextMenu={(e) => {
                            if (project.isRealProject) {
                              handleDeleteProject(e, project.projectCode, project.projectName);
                            }
                          }}
                        >
                          <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            {project.projectName}
                          </span>
                        </button>
                      ) : (
                        <DroppableProjectSection
                          projectCode={project.projectCode}
                          isExpanded={!isCollapsed}
                        >
                          <div 
                            className="h-full flex flex-col bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-card dark:shadow-card-dark overflow-hidden"
                            style={{ width: `${columnWidth}vw` }}
                          >
                          {/* Project Header */}
                          <div 
                            className="px-3 pt-3 pb-3  shrink-0 border-b border-light-border dark:border-dark-border"
                            onContextMenu={(e) => {
                              if (project.isRealProject) {
                                handleDeleteProject(e, project.projectCode, project.projectName);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                onClick={() => {
                                  if (project.isRealProject) {
                                    router.push(`/project/${project.projectCode}`);
                                  }
                                }}
                                className={`flex items-center gap-2 flex-1 min-w-0 ${project.isRealProject ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                              >
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-title font-semibold text-light-text dark:text-dark-text truncate">
                                    {project.projectName}
                                  </h3>
                                  {project.isRealProject && (
                                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                      {project.projectCode}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                  {project.campaigns.length} campaign{project.campaigns.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                  {project.totalCalls} calls
                                </span>
                              </div>
                              
                              {/* Cost Tracking Bar */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Budget
                                  </span>
                                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {isNaN(costPercentage) ? 0 : costPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      costPercentage > 90 ? 'bg-red-500' : 
                                      costPercentage > 75 ? 'bg-orange-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${isNaN(costPercentage) ? 0 : Math.min(costPercentage, 100)}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {formatCurrency(project.totalSpent)}
                                  </span>
                                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {formatCurrency(project.totalBudget)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Campaigns List */}
                          <div className="flex-1 overflow-y-auto">
                            <SortableContext
                              items={campaignIds}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="p-3 space-y-2">
                                {project.campaigns.map((campaign) => (
                                  <DraggableCampaignCardRow
                                    key={campaign.id}
                                    campaign={campaign}
                                    projectCode={project.projectCode}
                                    onDelete={handleDeleteCampaign}
                                    onNavigate={(id) => router.push(`/campaign/${id}/settings`)}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </div>
                        </div>
                        </DroppableProjectSection>
                      )}
                      
                      {/* Resizable Divider */}
                      {projectIndex < groupedProjects.length - 1 && (
                        <div
                          className="w-[6px] shrink-0 relative cursor-col-resize select-none group flex items-center justify-center"
                          onMouseDown={onMouseDownDivider(projectIndex)}
                        >
                          <div className="h-[1in] w-[10px] rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex items-center justify-center">
                            <GripVertical className="h-3 w-3 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <DragOverlay>
                {activeDragId ? (
                  <div className="bg-light-surface dark:bg-dark-surface border-2 border-primary-500 rounded-lg p-4 shadow-xl opacity-90">
                    <div className="font-medium text-light-text dark:text-dark-text">
                      {campaigns.find(c => c.id === activeDragId)?.campaignName || "Campaign"}
                    </div>
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      Moving campaign...
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        itemName={campaignToDelete?.name || ""}
        itemType="Campaign"
        onConfirm={confirmDeleteCampaign}
        onCancel={cancelDeleteCampaign}
      />
      
      <DeleteConfirmationModal
        isOpen={isProjectDeleteModalOpen}
        itemName={projectToDelete?.name || ""}
        itemType="Project"
        onConfirm={confirmDeleteProject}
        onCancel={cancelDeleteProject}
      />
      
      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleNewProject}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
          <div className="text-body text-light-text-secondary dark:text-dark-text-secondary">
            Loading...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="h-full">
            <HomeContent />
          </div>
        </SidebarInset>
      </div>
    </Suspense>
  );
}
