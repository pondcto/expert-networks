"use client"

import React from "react"
import {
  Home,
  FolderOpen,
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useNavigation } from "./navigation-context"
import { useSidebar } from "@/components/ui/sidebar"
import Link from "next/link";
import { usePathname } from "next/navigation";
import NewProjectModal from "./NewProjectModal";

// Type definitions
interface Campaign {
  id: string;
  campaignName: string;
  projectCode: string;
  industryVertical: string;
  startDate: string;
  targetCompletionDate: string;
  estimatedCalls?: number; // Keep for backward compatibility
  minCalls?: number;
  maxCalls?: number;
  teamMembers: { id: string; name: string; designation: string; avatar: string }[];
  createdAt: string;
  updatedAt: string;
  order?: number;
}

interface Project {
  projectCode: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectWithCampaigns extends Project {
  campaigns: Campaign[];
}

// Helper function to get saved campaigns from localStorage
const getSavedCampaigns = (): Campaign[] => {
  if (typeof window === 'undefined') return [];
  
  const campaigns: Campaign[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('campaign_')) {
      try {
        const campaignData = JSON.parse(localStorage.getItem(key) || '{}');
        if (campaignData.id && campaignData.campaignName) {
          campaigns.push(campaignData as Campaign);
        }
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }
  console.log('Campaigns:', campaigns);
  return campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Sort by newest first
};

// Helper function to get saved projects from localStorage
const getSavedProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  
  const projects: Project[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('project_')) {
      try {
        const projectData = JSON.parse(localStorage.getItem(key) || '{}');
        if (projectData.projectCode && projectData.projectName) {
          projects.push(projectData as Project);
        }
      } catch (error) {
        console.error('Error parsing project data:', error);
      }
    }
  }
  return projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Sort by newest first
};

const menuItems = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "campaigns",
    title: "Campaigns",
    icon: FolderOpen,
    href: "#",
    hasSubItems: true,
  },
  {
    id: "new-project",
    title: "New Project",
    icon: Plus,
    href: "/project/new",
  },
  {
    id: "new-campaign",
    title: "New Campaign",
    icon: Plus,
    href: "/campaign/new",
  },
]

const bottomMenuItems = [
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpen, isMobile, state } = useSidebar();
  const [expandedProjects, setExpandedProjects] = React.useState<string[]>([]);
  const { setActiveNav, setHoverNav } = useNavigation();
  const [savedCampaigns, setSavedCampaigns] = React.useState<Campaign[]>([]);
  const [savedProjects, setSavedProjects] = React.useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = React.useState(false);

  // Load saved campaigns and projects on component mount
  React.useEffect(() => {
    const campaigns = getSavedCampaigns();
    const projects = getSavedProjects();
    setSavedCampaigns(campaigns);
    setSavedProjects(projects);
  }, []); // Only load once on mount

  // Listen for campaign and project save events to refresh the list
  React.useEffect(() => {
    const handleCampaignSaved = () => {
      const campaigns = getSavedCampaigns();
      setSavedCampaigns(campaigns);
    };

    const handleProjectSaved = () => {
      const projects = getSavedProjects();
      setSavedProjects(projects);
    };

    window.addEventListener('campaignSaved', handleCampaignSaved);
    window.addEventListener('projectSaved', handleProjectSaved);
    return () => {
      window.removeEventListener('campaignSaved', handleCampaignSaved);
      window.removeEventListener('projectSaved', handleProjectSaved);
    };
  }, []);

  // Helper to toggle project expansion
  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Group campaigns by project
  const getProjectsWithCampaigns = () => {
    const projectMap = new Map<string, ProjectWithCampaigns>();
    
    // Add all saved projects
    savedProjects.forEach((project: Project) => {
      projectMap.set(project.projectCode, {
        ...project,
        campaigns: []
      });
    });

    // Group campaigns by project
    savedCampaigns.forEach((campaign: Campaign) => {
      const projectCode = campaign.projectCode || '';
      
      if (projectCode && projectMap.has(projectCode)) {
        // Add campaign to existing project
        projectMap.get(projectCode)!.campaigns.push(campaign);
      }
    });

    // Get campaigns without valid projects for "Other Campaigns" group
    const campaignsWithoutProject = savedCampaigns.filter((campaign: Campaign) => {
      const projectCode = campaign.projectCode || '';
      return !projectCode || !projectMap.has(projectCode);
    });

    // Convert to array and sort by most recent
    const projects = Array.from(projectMap.values()).sort((a, b) => 
      b.createdAt.localeCompare(a.createdAt)
    );

    return { projects, campaignsWithoutProject };
  };

  // Handle new project creation
  const handleNewProject = (projectData: { projectName: string; projectCode: string }) => {
    const project = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(`project_${projectData.projectCode}`, JSON.stringify(project));

    // Dispatch event to update dashboard
    window.dispatchEvent(new CustomEvent('projectSaved'));
    
    // Close modal
    setIsNewProjectModalOpen(false);
  };

  // Handle new project button click
  const handleNewProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNewProjectModalOpen(true);
  };

  return (
    <div
      className="group"
      onMouseEnter={() => { if (!isMobile) setOpen(true) }}
      onMouseLeave={() => {
        if (!isMobile) setOpen(false);
        setHoverNav(null);
      }}
    >
      <Sidebar
        collapsible="icon"
        className="border-r border-light-border dark:border-dark-border transition-all duration-300 group-hover:w-64 bg-[var(--sidebar-bg)] text-inherit"
        {...props}
      >
        {state === "collapsed" ? (
          <nav className="flex flex-col h-full bg-[var(--sidebar-bg)] px-2 pt-6 pb-4">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                
                if (item.id === "new-project") {
                  return (
                    <div
                      key={item.id}
                      className="h-10 w-full flex items-center justify-center relative"
                    >
                      <button
                        onClick={handleNewProjectClick}
                        className="p-2 rounded-md transition-all duration-200 hover:bg-primary-500/5 dark:hover:bg-primary-500/10"
                      >
                        <item.icon className="h-5 w-5 stroke-[1.5] transition-colors duration-200 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 dark:hover:text-primary-400" />
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={item.id}
                    className="h-10 w-full flex items-center justify-center relative"
                  >
                    <Link
                      href={item.href}
                      className={`p-2 rounded-md transition-all duration-200 ${isActive ? 'bg-primary-500/15 dark:bg-primary-500/20' : 'hover:bg-primary-500/5 dark:hover:bg-primary-500/10'}`}
                    >
                      <item.icon className={`h-5 w-5 stroke-[1.5] transition-colors duration-200 ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 dark:hover:text-primary-400'}`} />
                    </Link>
                  </div>
                );
              })}
            </div>
            
            {/* Bottom Menu Items */}
            <div className="mt-auto flex flex-col gap-2 border-t border-light-border dark:border-dark-border pt-2">
              {bottomMenuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <div
                    key={item.id}
                    className="h-10 w-full flex items-center justify-center relative"
                  >
                    <Link
                      href={item.href}
                      className={`p-2 rounded-md transition-all duration-200 ${isActive ? 'bg-primary-500/15 dark:bg-primary-500/20' : 'hover:bg-primary-500/5 dark:hover:bg-primary-500/10'}`}
                    >
                      <item.icon className={`h-5 w-5 stroke-[1.5] transition-colors duration-200 ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 dark:hover:text-primary-400'}`} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>
        ) : (
          <SidebarContent className="bg-transparent text-inherit pt-6">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    
                    if (item.id === "campaigns") {
                      return (
                        <div key={item.id}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              className={`text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover ${isActive ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" : ""}`}
                            >
                              <Link
                                href={item.href}
                                className="flex items-center gap-2 w-full"
                                onClick={() => setActiveNav({ level1: item.title })}
                              >
                                <item.icon className="h-4 w-4 stroke-[1.5]" />
                                <span className="text-sm">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          
                          {/* Projects with Campaigns */}
                          <div className="ml-3 space-y-1">
                            {(() => {
                              const { projects, campaignsWithoutProject } = getProjectsWithCampaigns();
                              
                              return (
                                <>
                                  {/* Projects */}
                                  {projects.map((project: ProjectWithCampaigns) => (
                                    <div key={project.projectCode}>
                                      {/* Project Header */}
                                      <div className="flex items-center">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleProject(project.projectCode);
                                          }}
                                          className="w-full flex items-center gap-2 px-1 py-1 text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded transition-colors text-left"
                                        >
                                          {expandedProjects.includes(project.projectCode) ? (
                                            <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 flex-shrink-0" />
                                          )}
                                          <span className="font-medium">
                                            {project.projectName}
                                          </span>
                                        </button>
                                        
                                      </div>
                                      
                                      {/* Campaigns under Project */}
                                      {expandedProjects.includes(project.projectCode) && (
                                        <div className="ml-9 space-y-1">
                                          {project.campaigns.length > 0 ? (
                                            project.campaigns.map((campaign: Campaign) => {
                                              const campaignHref = `/campaign/${campaign.id}/settings`;
                                              const isCampaignActive = pathname?.includes(`/campaign/${campaign.id}`);
                                              return (
                                                <Link
                                                  key={campaign.id}
                                                  href={campaignHref}
                                                  className={`block px-1 py-1 text-sm rounded transition-colors ${
                                                    isCampaignActive 
                                                      ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" 
                                                      : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
                                                  }`}
                                                  onClick={() => setActiveNav({ 
                                                    level1: item.title, 
                                                    level2: project.projectName, 
                                                    level3: campaign.campaignName || 'Unnamed Campaign'
                                                  })}
                                                >
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{campaign.campaignName || 'Unnamed Campaign'}</span>
                                                    <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                                      {campaign.industryVertical || 'No industry'}
                                                    </span>
                                                  </div>
                                                </Link>
                                              );
                                            })
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {/* Other Campaigns (without project) */}
                                  {campaignsWithoutProject.length > 0 && (
                                    <div>
                            <button
                                        onClick={() => toggleProject('other-campaigns')}
                              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded transition-colors"
                            >
                                        {expandedProjects.includes('other-campaigns') ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                                        <span>Other Campaigns</span>
                                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary ml-auto">
                                          {campaignsWithoutProject.length}
                                        </span>
                            </button>
                            
                                      {expandedProjects.includes('other-campaigns') && (
                              <div className="ml-6 space-y-1">
                                          {campaignsWithoutProject.map((campaign: Campaign) => {
                                            const campaignHref = `/campaign/${campaign.id}/settings`;
                                            const isCampaignActive = pathname?.includes(`/campaign/${campaign.id}`);
                                    return (
                                      <Link
                                                key={campaign.id}
                                        href={campaignHref}
                                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                                          isCampaignActive 
                                            ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" 
                                            : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
                                        }`}
                                        onClick={() => setActiveNav({ 
                                          level1: item.title, 
                                                  level2: 'Other Campaigns', 
                                                  level3: campaign.campaignName || 'Unnamed Campaign'
                                        })}
                                      >
                                        <div className="flex flex-col">
                                                  <span className="font-medium">{campaign.campaignName || 'Unnamed Campaign'}</span>
                                          <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    {campaign.industryVertical || 'No industry'}
                                          </span>
                                        </div>
                                      </Link>
                                    );
                                          })}
                                  </div>
                                )}
                              </div>
                            )}
                                  
                                  {/* No projects or campaigns */}
                                  {projects.length === 0 && campaignsWithoutProject.length === 0 && (
                                    <div className="px-2 py-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                      No projects or campaigns yet
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    }
                    
                    if (item.id === "new-project") {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={handleNewProjectClick}
                            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover cursor-pointer"
                          >
                            <item.icon className="h-4 w-4 stroke-[1.5]" />
                            <span className="text-sm">{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          className={`text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover ${isActive ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" : ""}`}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 w-full"
                            onClick={() => setActiveNav({ level1: item.title })}
                          >
                            <item.icon className="h-4 w-4 stroke-[1.5]" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Bottom Menu Group */}
            <SidebarGroup className="mt-auto border-t border-light-border dark:border-dark-border pt-2">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {bottomMenuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          className={`text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover ${isActive ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" : ""}`}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 w-full"
                            onClick={() => setActiveNav({ level1: item.title })}
                          >
                            <item.icon className="h-4 w-4 stroke-[1.5]" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
        <SidebarRail />
      </Sidebar>
      
      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleNewProject}
      />
    </div>
  );
}