"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "../../components/app-sidebar";
import { SidebarInset } from "../../components/ui/sidebar";
import Logo from "../../components/Logo";
import { useTheme } from "../../providers/theme-provider";
import UserMenu from "../../components/UserMenu";
import { Sun, Moon, Users, Calendar, FolderOpen, Trash2, DollarSign, ArrowLeft } from "lucide-react";

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
}

interface Project {
  projectName: string;
  projectCode: string;
  createdAt: string;
  updatedAt: string;
}

function ProjectDashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const projectCode = params.project_code as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Load project and campaigns
  useEffect(() => {
    const loadData = () => {
      // Load project
      try {
        const projectData = localStorage.getItem(`project_${projectCode}`);
        if (projectData) {
          setProject(JSON.parse(projectData));
        }
      } catch (error) {
        console.error("Error loading project:", error);
      }

      // Load campaigns for this project
      const allCampaigns: Campaign[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("campaign_")) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const campaign = JSON.parse(data);
              if (campaign.projectCode === projectCode) {
                allCampaigns.push(campaign);
              }
            }
          } catch (error) {
            console.error("Error parsing campaign data:", error);
          }
        }
      }
      
      allCampaigns.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - 
        new Date(a.updatedAt || a.createdAt).getTime()
      );
      setCampaigns(allCampaigns);
    };

    loadData();

    // Listen for updates
    const handleCampaignSaved = () => {
      loadData();
    };
    const handleProjectSaved = () => {
      loadData();
    };

    window.addEventListener("campaignSaved", handleCampaignSaved);
    window.addEventListener("projectSaved", handleProjectSaved);
    return () => {
      window.removeEventListener("campaignSaved", handleCampaignSaved);
      window.removeEventListener("projectSaved", handleProjectSaved);
    };
  }, [projectCode]);

  // Calculate campaign status
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

  // Calculate progress
  const calculateProgress = (campaign: Campaign): number => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.targetCompletionDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Delete campaign
  const handleDeleteCampaign = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      localStorage.removeItem(`campaign_${campaignId}`);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      window.dispatchEvent(new CustomEvent('campaignSaved'));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Any") return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

  // Calculate project totals
  const totalCalls = campaigns.reduce((sum, c) => sum + (c.estimatedCalls || 0), 0);
  const avgCostPerCall = 1000;
  const totalBudget = totalCalls * avgCostPerCall;
  const totalSpent = campaigns.reduce((sum, c) => {
    const status = getCampaignStatus(c);
    if (status.isActive) {
      const progress = calculateProgress(c) / 100;
      return sum + (c.estimatedCalls * avgCostPerCall * progress);
    } else if (status.label === "Completed") {
      return sum + (c.estimatedCalls * avgCostPerCall);
    }
    return sum;
  }, 0);
  const costPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (!project) {
    return (
      <main className="h-screen flex flex-col bg-light-background dark:bg-dark-background">
        <header className="w-[100vw] sticky top-0 z-50 shrink-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-2">
              Project Not Found
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              The project &ldquo;{projectCode}&rdquo; does not exist.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-light-background dark:bg-dark-background">
      {/* Header */}
      <header className="w-[100vw] sticky top-0 z-50 shrink-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
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
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Projects
          </button>

          {/* Project Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-3xl font-semibold text-light-text dark:text-dark-text">
                  {project.projectName}
                </h1>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Project Code: {project.projectCode}
                </p>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4">
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Total Campaigns
              </div>
              <div className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {campaigns.length}
              </div>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4">
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Total Calls
              </div>
              <div className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {totalCalls}
              </div>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4">
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Total Budget
              </div>
              <div className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {formatCurrency(totalBudget)}
              </div>
            </div>
          </div>

          {/* Budget Tracking */}
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Tracking
              </h3>
              <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  costPercentage > 90 ? 'bg-red-500' : 
                  costPercentage > 75 ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(costPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                {Math.round(costPercentage)}% utilized
              </span>
              <span className="text-sm font-medium text-light-text dark:text-dark-text">
                {formatCurrency(totalBudget - totalSpent)} remaining
              </span>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                Campaigns
              </h3>
            </div>

            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  No campaigns in this project yet
                </p>
                <button
                  onClick={() => router.push("/campaign/new")}
                  className="btn-primary"
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="flex gap-4 px-6 py-3 bg-light-background dark:bg-dark-background border-b border-light-border dark:border-dark-border">
                  <div className="w-[20%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Campaign Name
                  </div>
                  <div className="w-[22%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Status
                  </div>
                  <div className="w-[18%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Timeline
                  </div>
                  <div className="w-[15%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Team
                  </div>
                  <div className="w-[8%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Calls
                  </div>
                  <div className="w-[10%] text-sm font-semibold text-light-text dark:text-dark-text">
                    Industry
                  </div>
                  <div className="w-[7%] text-sm font-semibold text-light-text dark:text-dark-text text-right">
                    Actions
                  </div>
                </div>

                {/* Campaign Rows */}
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {campaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    const progress = status.isActive ? calculateProgress(campaign) : 0;
                    
                    return (
                      <div
                        key={campaign.id}
                        className="group flex gap-4 px-6 py-4 hover:bg-light-background dark:hover:bg-dark-background transition-colors"
                      >
                        {/* Campaign Name */}
                        <div 
                          className="w-[20%] cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          <div className="font-medium text-light-text dark:text-dark-text">
                            {campaign.campaignName}
                          </div>
                        </div>

                        {/* Status */}
                        <div 
                          className="w-[22%] flex items-center cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          {status.isActive ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  Active
                                </span>
                                <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          )}
                        </div>

                        {/* Timeline */}
                        <div 
                          className="w-[18%] flex items-center gap-1 cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          <Calendar className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
                          <div className="text-sm text-light-text dark:text-dark-text">
                            <div>{formatDate(campaign.startDate)}</div>
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                              to {formatDate(campaign.targetCompletionDate)}
                            </div>
                          </div>
                        </div>

                        {/* Team */}
                        <div 
                          className="w-[15%] flex items-center gap-2 cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          <Users className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
                          <div className="flex -space-x-2">
                            {campaign.teamMembers && campaign.teamMembers.length > 0 ? (
                              <>
                                {campaign.teamMembers.slice(0, 3).map((member) => (
                                  <img
                                    key={member.id}
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-8 h-8 rounded-full border-2 border-light-surface dark:border-dark-surface object-cover"
                                    title={member.name}
                                  />
                                ))}
                                {campaign.teamMembers.length > 3 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-light-surface dark:border-dark-surface bg-light-background-secondary dark:bg-dark-background-secondary flex items-center justify-center text-xs font-medium text-light-text dark:text-dark-text">
                                    +{campaign.teamMembers.length - 3}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                No team
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Calls */}
                        <div 
                          className="w-[8%] flex items-center cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          <span className="text-sm text-light-text dark:text-dark-text">
                            {campaign.estimatedCalls}
                          </span>
                        </div>

                        {/* Industry */}
                        <div 
                          className="w-[10%] flex items-center cursor-pointer"
                          onClick={() => router.push(`/campaign/${campaign.id}/settings`)}
                        >
                          <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                            {campaign.industryVertical}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <div className="w-[7%] flex items-center justify-end">
                          <button
                            onClick={(e) => handleDeleteCampaign(e, campaign.id)}
                            className="p-2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProjectDashboardPage() {
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
            <ProjectDashboardContent />
          </div>
        </SidebarInset>
      </div>
    </Suspense>
  );
}

