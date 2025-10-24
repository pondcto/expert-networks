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

// Helper function to get saved campaigns from localStorage
const getSavedCampaigns = () => {
  if (typeof window === 'undefined') return [];
  
  const campaigns = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('campaign_')) {
      try {
        const campaignData = JSON.parse(localStorage.getItem(key) || '{}');
        if (campaignData.id && campaignData.campaignName) {
          campaigns.push({
            id: campaignData.id,
            name: campaignData.campaignName,
            industry: campaignData.industryVertical || 'Any',
            description: campaignData.briefDescription || '',
            createdAt: campaignData.createdAt || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }
  console.log('Campaigns:', campaigns);
  return campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // Sort by newest first
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
  const [expandedProjects, setExpandedProjects] = React.useState<string[]>(['recent-campaigns']);
  const { setActiveNav, setHoverNav } = useNavigation();
  const [savedCampaigns, setSavedCampaigns] = React.useState<unknown[]>([]);

  // Load saved campaigns on component mount
  React.useEffect(() => {
    const campaigns = getSavedCampaigns();
    setSavedCampaigns(campaigns);
  }, []); // Only load once on mount

  // Listen for campaign save events to refresh the list
  React.useEffect(() => {
    const handleCampaignSaved = () => {
      const campaigns = getSavedCampaigns();
      setSavedCampaigns(campaigns);
    };

    window.addEventListener('campaignSaved', handleCampaignSaved);
    return () => window.removeEventListener('campaignSaved', handleCampaignSaved);
  }, []);

  // Helper to toggle project expansion
  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
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
                          
                          {/* Recent Campaigns */}
                          <div className="ml-6 space-y-1">
                            <button
                              onClick={() => toggleProject('recent-campaigns')}
                              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded transition-colors"
                            >
                              {expandedProjects.includes('recent-campaigns') ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              <span>AI-MR-2024-Q1</span>
                            </button>
                            
                            {expandedProjects.includes('recent-campaigns') && (
                              <div className="ml-6 space-y-1">
                                {savedCampaigns.length > 0 ? (
                                  savedCampaigns.map((campaign: unknown) => {
                                    const campaignData = campaign as { id: string; name?: string; industry?: string };
                                    const campaignHref = `/campaign/${campaignData.id}/settings`;
                                    const isCampaignActive = pathname?.includes(`/campaign/${campaignData.id}`);
                                    return (
                                      <Link
                                        key={campaignData.id}
                                        href={campaignHref}
                                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                                          isCampaignActive 
                                            ? "bg-light-surface-active text-light-text dark:bg-dark-surface-active dark:text-dark-text" 
                                            : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
                                        }`}
                                        onClick={() => setActiveNav({ 
                                          level1: item.title, 
                                          level2: 'Recent Campaigns', 
                                          level3: campaignData.name || 'Unnamed Campaign'
                                        })}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{campaignData.name || 'Unnamed Campaign'}</span>
                                          <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                            {campaignData.industry || 'No industry'}
                                          </span>
                                        </div>
                                      </Link>
                                    );
                                  })
                                ) : (
                                  <div className="px-2 py-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                    No campaigns yet
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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
    </div>
  );
}