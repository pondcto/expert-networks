"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset } from "./components/ui/sidebar";
import Logo from "./components/Logo";
import { useTheme } from "./providers/theme-provider";
import UserMenu from "./components/UserMenu";
import NewProjectModal from "./components/NewProjectModal";
import { Sun, Moon, Calendar, FolderOpen, Plus, ChevronDown, ChevronRight, Trash2, GripVertical } from "lucide-react";
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
  targetRegions?: string[];
}

interface Project {
  projectCode: string;
  projectName: string;
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
  order?: number;
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

// Draggable Campaign Card Row Component (single line display)
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

  // Format date range for timeline
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || startDate === "Any") return "TBD";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startStr} - ${endStr}`;
  };

  // Calculate budget info
  const avgCostPerCall = 1000;
  const totalBudget = (campaign.estimatedCalls || 0) * avgCostPerCall;
  const status = getCampaignStatus(campaign);
  let totalSpent = 0;
  
  if (status.isActive) {
    const progress = calculateProgress(campaign) / 100;
    totalSpent = totalBudget * progress;
  } else if (status.label === "Completed") {
    totalSpent = totalBudget;
  }
  
  const costPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get target regions (from campaign data if available)
  const targetRegions: string[] = campaign.targetRegions && campaign.targetRegions.length > 0 
    ? campaign.targetRegions 
    : ["North America", "Europe"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 ml-6 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg p-1 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
    >
      {/* Drag Handle */}
      <div 
        className="flex-shrink-0 w-4 cursor-grab active:cursor-grabbing"
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Campaign Name */}
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
      </div>

      {/* Industry */}
      <div className="flex-1 min-w-0 text-center">
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
          {campaign.industryVertical}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{formatDateRange(campaign.startDate, campaign.targetCompletionDate)}</span>
        </div>
      </div>

      {/* Target Regions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {targetRegions.slice(0, 2).map((region: string, index: number) => (
            <span 
              key={index}
              className="inline-block px-2 py-0.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded text-xs text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[80px]"
              title={region}
            >
              {region}
            </span>
          ))}
          {targetRegions.length > 2 && (
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0">
              +{targetRegions.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Budget / Cost Bar */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Budget</span>
            <span className={`font-medium ${
              costPercentage > 90 ? 'text-red-600 dark:text-red-400' : 
              costPercentage > 75 ? 'text-orange-600 dark:text-orange-400' : 
              'text-green-600 dark:text-green-400'
            }`}>
              {isNaN(costPercentage) ? 0 : costPercentage}%
            </span>
          </div>
          <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                costPercentage > 90 ? 'bg-red-500' : 
                costPercentage > 75 ? 'bg-orange-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${isNaN(costPercentage) ? 0 : costPercentage}%` }}
            />
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary truncate">
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0 w-16 text-center">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Calls */}
      <div className="flex-shrink-0 w-20 text-center">
        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
          Calls: {campaign.estimatedCalls}
        </span>
      </div>

      {/* Team */}
      <div className="flex-shrink-0 w-20">
        {campaign.teamMembers && campaign.teamMembers.length > 0 ? (
          <div className="flex -space-x-1 justify-end">
            {campaign.teamMembers.slice(0, 3).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="w-6 h-6 rounded-full border-2 border-light-background dark:border-dark-background object-cover"
                title={member.name}
              />
            ))}
            {campaign.teamMembers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-light-background dark:border-dark-background bg-light-background-secondary dark:bg-dark-background-secondary flex items-center justify-center text-[10px] font-medium text-light-text dark:text-dark-text">
                +{campaign.teamMembers.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e, campaign.id);
        }}
        className="flex-shrink-0 w-8 h-8 p-1.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
        title="Delete campaign"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Project Card Component with Toggle (Now Sortable)
function ProjectCard({
  project,
  costPercentage,
  campaignIds,
  onDeleteProject,
  onDeleteCampaign,
  onNavigateToCampaign,
  onNavigateToProject,
  formatCurrency,
}: {
  project: ProjectGroup;
  costPercentage: number;
  campaignIds: string[];
  onDeleteProject: (e: React.MouseEvent, projectCode: string, projectName: string) => void;
  onDeleteCampaign: (e: React.MouseEvent, campaignId: string) => void;
  onNavigateToCampaign: (campaignId: string) => void;
  onNavigateToProject: (projectCode: string) => void;
  formatCurrency: (amount: number) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ 
    id: project.projectCode,
    data: { type: 'project', project }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if a project is being dragged and this card is the drop target
  const isDraggingProject = active?.data?.current?.type === 'project';
  const showDropIndicator = isDraggingProject && isOver && !isDragging;

  return (
    <DroppableProjectSection
      projectCode={project.projectCode}
      isExpanded={true}
    >
      <div 
        ref={setNodeRef}
        style={style}
        className={`group w-full bg-light-surface dark:bg-dark-surface border ${
          showDropIndicator 
            ? 'border-primary-500 border-2 shadow-lg shadow-primary-500/20' 
            : 'border-light-border dark:border-dark-border'
        } rounded-lg shadow-card dark:shadow-card-dark overflow-hidden transition-all`}
      >
        {/* Project Header - Always Visible */}
        <div className="p-1">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div 
              className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
              )}
            </button>

            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {/* First Line: Project Name */}
              <h3 className="text-base font-semibold text-light-text dark:text-dark-text truncate hover:opacity-80 transition-opacity">
                {project.projectName}
              </h3>
              
              {/* Second Line: Project Code and Summary */}
              <div className="flex items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                {project.isRealProject && (
                  <>
                    <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                      {project.projectCode}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {project.campaigns.length} campaign{project.campaigns.length !== 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span>
                  {project.totalCalls} calls
                </span>
                <span>•</span>
                <span className={`font-medium ${
                  costPercentage > 90 ? 'text-red-600 dark:text-red-400' : 
                  costPercentage > 75 ? 'text-orange-600 dark:text-orange-400' : 
                  'text-green-600 dark:text-green-400'
                }`}>
                  {formatCurrency(project.totalSpent)} / {formatCurrency(project.totalBudget)}
                </span>
              </div>
            </div>

            {/* Delete Button */}
            {project.isRealProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(e, project.projectCode, project.projectName);
                }}
                className="flex-shrink-0 p-1.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Campaign List */}
        {isExpanded && (
          <div className="border-t border-light-border dark:border-dark-border">
            <SortableContext
              items={campaignIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-2 space-y-2">
                {project.campaigns.map((campaign) => (
                  <DraggableCampaignCardRow
                    key={campaign.id}
                    campaign={campaign}
                    projectCode={project.projectCode}
                    onDelete={onDeleteCampaign}
                    onNavigate={onNavigateToCampaign}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </div>
    </DroppableProjectSection>
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
  
  // Memoize grouped projects to ensure consistency
  const [groupedProjects, setGroupedProjects] = useState<ProjectGroup[]>([]);

  // Seed mock data into localStorage on first run (only if no campaigns exist)
  const seedMockDataOnce = () => {
    try {
      const alreadySeeded = localStorage.getItem("mock_data_seeded_v1");
      if (alreadySeeded) return;

      // If there is at least one campaign, skip seeding
      let hasCampaign = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("campaign_")) {
          hasCampaign = true;
          break;
        }
      }
      if (hasCampaign) {
        localStorage.setItem("mock_data_seeded_v1", "true");
        return;
      }

      // Seed projects
      const projectsToSeed = [
        { key: "project_PROJ-001", value: { projectName: "AI/ML Market Research", projectCode: "PROJ-001", createdAt: "2025-10-28T10:28:37.461Z", updatedAt: "2025-10-29T15:35:50.340Z", order: 2 } },
        { key: "project_PROJ-002", value: { projectName: "Healthcare Digital Transformation", projectCode: "PROJ-002", createdAt: "2025-10-28T10:28:52.199Z", updatedAt: "2025-10-29T15:35:50.340Z", order: 4 } },
        { key: "project_PROJ-003", value: { projectName: "Financial Services Innovation", projectCode: "PROJ-003", createdAt: "2025-10-28T10:29:07.941Z", updatedAt: "2025-10-29T15:35:50.340Z", order: 3 } },
        { key: "project_PROJ-004", value: { projectName: "Retail & E-commerce Strategy", projectCode: "PROJ-004", createdAt: "2025-10-28T10:29:22.949Z", updatedAt: "2025-10-29T15:35:50.340Z", order: 0 } },
        { key: "project_PROJ-005", value: { projectName: "Manufacturing Optimization", projectCode: "PROJ-005", createdAt: "2025-10-28T10:29:35.821Z", updatedAt: "2025-10-29T15:35:50.340Z", order: 1 } },
      ];

      projectsToSeed.forEach(p => localStorage.setItem(p.key, JSON.stringify(p.value)));

      // Seed campaigns
      const campaignsToSeed: Array<{ key: string; value: any }> = [
        {
          key: "campaign_ac609ac8fae0c8fd",
          value: {
            campaignName: "EHR System Integration",
            projectCode: "PROJ-002",
            industryVertical: "Healthcare",
            customIndustry: "",
            briefDescription: "EHR System Integration",
            expandedDescription: "",
            targetRegions: ["North America", "Europe"],
            startDate: "2025-10-20",
            targetCompletionDate: "2025-10-26",
            estimatedCalls: 10,
            teamMembers: [],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "ac609ac8fae0c8fd",
            createdAt: "2025-10-28T11:28:00.946Z",
            updatedAt: "2025-10-29T15:46:00.028Z",
            order: 0,
          }
        },
        {
          key: "campaign_e1a3616c55f154da",
          value: {
            campaignName: "AI Infrastructure Vendors",
            projectCode: "PROJ-001",
            industryVertical: "Technology",
            customIndustry: "",
            briefDescription: "AI Infrastructure Vendors",
            expandedDescription: "",
            targetRegions: ["Europe", "Asia Pacific"],
            startDate: "2025-10-01",
            targetCompletionDate: "2025-10-30",
            estimatedCalls: 12,
            teamMembers: [
              { id: "2", name: "Michael David", designation: "Data Analyst", avatar: "/images/avatar/Michael David.png" },
              { id: "8", name: "Richard Alan", designation: "Business Analyst", avatar: "/images/avatar/Richard Alan.png" },
              { id: "7", name: "Matthew Scott", designation: "Quality Analyst", avatar: "/images/avatar/Matthew Scott.png" },
              { id: "3", name: "David Charles", designation: "Content Specialist", avatar: "/images/avatar/David Charles.png" },
              { id: "1", name: "John Robert", designation: "Research Lead", avatar: "/images/avatar/John Robert.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "e1a3616c55f154da",
            createdAt: "2025-10-28T10:31:25.503Z",
            updatedAt: "2025-10-29T15:45:52.188Z",
            order: 2,
          }
        },
        {
          key: "campaign_210076ed1c11955b",
          value: {
            campaignName: "AI Ethics & Compliance",
            projectCode: "PROJ-001",
            industryVertical: "Technology",
            customIndustry: "",
            briefDescription: "AI Ethics & Compliance",
            expandedDescription: "",
            targetRegions: ["Middle East & Africa"],
            startDate: "2025-10-26",
            targetCompletionDate: "2025-10-29",
            estimatedCalls: 8,
            teamMembers: [
              { id: "10", name: "Thomas Edward", designation: "Market Analyst", avatar: "/images/avatar/Thomas Edward.png" },
              { id: "9", name: "Robert James", designation: "UX Researcher", avatar: "/images/avatar/Robert James.png" },
              { id: "7", name: "Matthew Scott", designation: "Quality Analyst", avatar: "/images/avatar/Matthew Scott.png" },
              { id: "6", name: "James William", designation: "Technical Writer", avatar: "/images/avatar/James William.png" },
              { id: "3", name: "David Charles", designation: "Content Specialist", avatar: "/images/avatar/David Charles.png" },
              { id: "1", name: "John Robert", designation: "Research Lead", avatar: "/images/avatar/John Robert.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "210076ed1c11955b",
            createdAt: "2025-10-28T10:34:33.406Z",
            updatedAt: "2025-10-29T15:45:52.187Z",
            order: 1,
          }
        },
        {
          key: "campaign_4cbc6d42bd510f11",
          value: {
            campaignName: "Enterprise ML Platforms",
            projectCode: "PROJ-001",
            industryVertical: "Technology",
            customIndustry: "",
            briefDescription: "Enterprise ML Platforms",
            expandedDescription: "",
            targetRegions: ["North America", "Middle East & Africa"],
            startDate: "2025-10-20",
            targetCompletionDate: "2025-11-21",
            estimatedCalls: 35,
            teamMembers: [
              { id: "8", name: "Richard Alan", designation: "Business Analyst", avatar: "/images/avatar/Richard Alan.png" },
              { id: "10", name: "Thomas Edward", designation: "Market Analyst", avatar: "/images/avatar/Thomas Edward.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "4cbc6d42bd510f11",
            createdAt: "2025-10-28T10:33:41.248Z",
            updatedAt: "2025-10-29T15:45:52.188Z",
            order: 3,
          }
        },
        {
          key: "campaign_4dcf7cf2faa79779",
          value: {
            campaignName: "Telemedicine Platform Adoption",
            projectCode: "PROJ-004",
            industryVertical: "Technology",
            customIndustry: "",
            briefDescription: "Telemedicine Platform Adoption",
            expandedDescription: "",
            targetRegions: ["Middle East & Africa", "Latin America"],
            startDate: "2025-10-24",
            targetCompletionDate: "2025-10-31",
            estimatedCalls: 12,
            teamMembers: [
              { id: "10", name: "Thomas Edward", designation: "Market Analyst", avatar: "/images/avatar/Thomas Edward.png" },
              { id: "6", name: "James William", designation: "Technical Writer", avatar: "/images/avatar/James William.png" },
              { id: "1", name: "John Robert", designation: "Research Lead", avatar: "/images/avatar/John Robert.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "4dcf7cf2faa79779",
            createdAt: "2025-10-28T10:35:20.261Z",
            updatedAt: "2025-10-29T15:46:29.571Z",
            order: 5,
          }
        },
        {
          key: "campaign_3b6b9b4677ffd51a",
          value: {
            campaignName: "IoT in Smart Factories",
            projectCode: "PROJ-005",
            industryVertical: "Manufacturing",
            customIndustry: "",
            briefDescription: "IoT in Smart Factories",
            expandedDescription: "",
            targetRegions: ["Latin America"],
            startDate: "2025-10-29",
            targetCompletionDate: "2025-11-20",
            estimatedCalls: 18,
            teamMembers: [
              { id: "1", name: "John Robert", designation: "Research Lead", avatar: "/images/avatar/John Robert.png" },
              { id: "8", name: "Richard Alan", designation: "Business Analyst", avatar: "/images/avatar/Richard Alan.png" },
              { id: "7", name: "Matthew Scott", designation: "Quality Analyst", avatar: "/images/avatar/Matthew Scott.png" },
              { id: "6", name: "James William", designation: "Technical Writer", avatar: "/images/avatar/James William.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "3b6b9b4677ffd51a",
            createdAt: "2025-10-28T11:31:25.522Z",
            updatedAt: "2025-10-29T15:46:08.299Z",
            order: 4,
          }
        },
        {
          key: "campaign_95c5d6ae2b3547c4",
          value: {
            campaignName: "Digital Banking Platforms",
            projectCode: "PROJ-003",
            industryVertical: "Finance",
            customIndustry: "",
            briefDescription: "Digital Banking Platforms",
            expandedDescription: "",
            targetRegions: ["Asia Pacific", "Europe"],
            startDate: "2025-10-29",
            targetCompletionDate: "2025-11-12",
            estimatedCalls: 15,
            teamMembers: [
              { id: "6", name: "James William", designation: "Technical Writer", avatar: "/images/avatar/James William.png" },
              { id: "5", name: "Daniel Paul", designation: "Project Manager", avatar: "/images/avatar/Daniel Paul.png" },
            ],
            screeningQuestions: [],
            selectedVendors: [],
            proposedExperts: [],
            id: "95c5d6ae2b3547c4",
            createdAt: "2025-10-28T11:32:30.986Z",
            updatedAt: "2025-10-29T15:46:15.919Z",
            order: 6,
          }
        },
      ];

      campaignsToSeed.forEach(c => localStorage.setItem(c.key, JSON.stringify(c.value)));

      localStorage.setItem("mock_data_seeded_v1", "true");
    } catch (e) {
      console.error("Error seeding mock data", e);
    }
  };

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
      // Seed once before loading
      seedMockDataOnce();
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
  }, [campaigns]);

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

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a project (by checking if it exists in groupedProjects)
    const draggedProject = groupedProjects.find(p => p.projectCode === activeId);
    
    if (draggedProject) {
      // We're dragging a project
      // Check if we're dropping over another project (not a campaign inside a project)
      let targetProjectCode = overId;
      
      // If dropping over a campaign, find its parent project
      const overCampaign = campaigns.find(c => c.id === overId);
      if (overCampaign) {
        // Dropping over a campaign - move to that campaign's project position
        targetProjectCode = overCampaign.projectCode || "Other Campaigns";
      }
      
      const overProject = groupedProjects.find(p => p.projectCode === targetProjectCode);
      
      if (overProject && activeId !== targetProjectCode) {
        const oldIndex = groupedProjects.findIndex(p => p.projectCode === activeId);
        const newIndex = groupedProjects.findIndex(p => p.projectCode === targetProjectCode);
        
        // Reorder projects
        const reorderedProjects = arrayMove(groupedProjects, oldIndex, newIndex);
        
        // Update order field for all projects
        reorderedProjects.forEach((project, index) => {
          if (project.isRealProject) {
            try {
              const projectData = JSON.parse(localStorage.getItem(`project_${project.projectCode}`) || '{}');
              projectData.order = index;
              projectData.updatedAt = new Date().toISOString();
              localStorage.setItem(`project_${project.projectCode}`, JSON.stringify(projectData));
            } catch (error) {
              console.error('Error updating project order:', error);
            }
          }
        });
        
        // Update state
        setGroupedProjects(reorderedProjects);
        
        // Dispatch event to update sidebar
        window.dispatchEvent(new CustomEvent('projectSaved'));
      }
      return;
    }

    // Otherwise, we're dragging a campaign
    const draggedCampaignId = activeId;
    const overItemId = overId;

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
    // Count existing projects to set order
    let projectCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        projectCount++;
      }
    }
    
    const project = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: projectCount, // Initialize with current count
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
    const allProjects: Array<{ projectCode: string; projectName: string; createdAt: string; order?: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        try {
          const projectData = JSON.parse(localStorage.getItem(key) || '{}');
          if (projectData.projectCode && projectData.projectName) {
            // Initialize order if not present
            if (projectData.order === undefined) {
              projectData.order = allProjects.length;
              localStorage.setItem(key, JSON.stringify(projectData));
            }
            allProjects.push({
              projectCode: projectData.projectCode,
              projectName: projectData.projectName,
              createdAt: projectData.createdAt || new Date().toISOString(),
              order: projectData.order
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
      const projectInfo = allProjects.find(p => p.projectCode === projectCode);
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
        isRealProject,
        order: projectInfo?.order
      };
    }).sort((a, b) => {
      // Sort "Other Campaigns" to the end
      if (a.projectCode === "Other Campaigns") return 1;
      if (b.projectCode === "Other Campaigns") return -1;
      
      // Sort by order field if available, otherwise by creation date
      const orderA = a.order !== undefined ? a.order : 999999;
      const orderB = b.order !== undefined ? b.order : 999999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Fallback to creation date if orders are equal
      const aProject = allProjects.find(p => p.projectCode === a.projectCode);
      const bProject = allProjects.find(p => p.projectCode === b.projectCode);
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
        <div className="w-[100vw-48px] h-full px-2 pb-2 ml-[48px] overflow-y-auto overflow-x-hidden">

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
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groupedProjects.map(p => p.projectCode)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 overflow-y-auto" ref={containerRef}>
                  {groupedProjects.map((project, projectIndex) => {
                    const costPercentage = project.totalBudget > 0 
                      ? Math.min(Math.round((project.totalSpent / project.totalBudget) * 100), 100)
                      : 0;
                    const campaignIds = project.campaigns.map(c => c.id);
                    
                    return (
                      <ProjectCard
                        key={project.projectCode}
                        project={project}
                        costPercentage={costPercentage}
                        campaignIds={campaignIds}
                        onDeleteProject={handleDeleteProject}
                        onDeleteCampaign={handleDeleteCampaign}
                        onNavigateToCampaign={(id) => router.push(`/campaign/${id}/settings`)}
                        onNavigateToProject={(code) => router.push(`/project/${code}`)}
                        formatCurrency={formatCurrency}
                      />
                    );
                  })}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeDragId ? (
                  (() => {
                    const draggedCampaign = campaigns.find(c => c.id === activeDragId);
                    const draggedProject = groupedProjects.find(p => p.projectCode === activeDragId);
                    
                    if (draggedProject) {
                      return (
                        <div className="bg-light-surface dark:bg-dark-surface border-2 border-primary-500 rounded-lg p-4 shadow-xl opacity-90">
                          <div className="font-medium text-light-text dark:text-dark-text">
                            {draggedProject.projectName}
                          </div>
                          <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Moving project...
                          </div>
                        </div>
                      );
                    }
                    
                    if (draggedCampaign) {
                      return (
                        <div className="bg-light-surface dark:bg-dark-surface border-2 border-primary-500 rounded-lg p-4 shadow-xl opacity-90">
                          <div className="font-medium text-light-text dark:text-dark-text">
                            {draggedCampaign.campaignName}
                          </div>
                          <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Moving campaign...
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()
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
