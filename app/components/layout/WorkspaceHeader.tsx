"use client";
import React from "react";
import { Sun, Moon, Settings, Users, MessageSquare } from "lucide-react";
import { useTheme } from "../../providers/theme-provider";
import { useRouter } from "next/navigation";
import UserMenu from "../UserMenu";
import Logo from "../Logo";

interface WorkspaceHeaderProps {
  campaignName?: string;
  campaignId?: string;
  currentTab?: "settings" | "experts" | "interviews";
}

export default function WorkspaceHeader({ 
  campaignName = "New Campaign", 
  campaignId,
  currentTab = "settings"
}: WorkspaceHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleNavigateToSettings = () => {
    if (campaignId) {
      router.push(`/campaign/${campaignId}/settings`);
    }
  };

  const handleNavigateToExperts = () => {
    if (campaignId) {
      router.push(`/campaign/${campaignId}/experts`);
    }
  };

  const handleNavigateToInterviews = () => {
    if (campaignId) {
      router.push(`/campaign/${campaignId}/interviews`);
    }
  };

  return (
    <header className="w-[100vw] sticky top-0 z-50 shrink-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Campaign Name */}
        <div className="flex items-center gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-primary-600/80 dark:text-primary-300/80 whitespace-nowrap mt-1 pb-[1px]">
              |
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-primary-600/80 dark:text-primary-300/80 whitespace-nowrap mt-1 pb-[1px]">
              {campaignName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Center - Navigation Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleNavigateToSettings}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === "settings"
                  ? "bg-light-surface-active text-light border border-primary-500 dark:bg-dark-surface-active dark:border-white"
                  : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleNavigateToExperts}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === "experts"
                  ? "bg-light-surface-active text-light border border-primary-500 dark:bg-dark-surface-active dark:border-white"
                  : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
              }`}
            >
              <Users className="w-4 h-4" />
              Experts
            </button>
            <button
              onClick={handleNavigateToInterviews}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === "interviews"
                  ? "bg-light-surface-active text-light border border-primary-500 dark:bg-dark-surface-active dark:border-white"
                  : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Interviews
            </button>
          </div>

          {/* Right side - Theme Toggle and User Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-light-text dark:text-dark-text" />
              ) : (
                <Moon className="w-5 h-5 text-light-text dark:text-dark-text" />
              )}
            </button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
