"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { useCampaign, CampaignData } from "../../lib/campaign-context";
import { useRouter, usePathname } from "next/navigation";
import { WorkspaceHeader } from "../layout";
import { PanelSizing } from "../../types";
import ScreeningQuestionsPanel from "./ScreeningQuestionsPanel";
import CampaignBasicsPanel from "./CampaignBasicsPanel";
import ScopeRefinementPanel from "./ScopeRefinementPanel";
import TeamMembersPanel from "./TeamMembersPanel";
import VendorSelectionPanel from "./VendorSelectionPanel";

export default function CampaignSettingsWorkspace() {
  const { campaignData, setCampaignData, saveCampaign, isNewCampaign } = useCampaign();
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel sizing states using optimized type
  const [panelSizing, setPanelSizing] = useState<PanelSizing>({
    chatWidth: 30, // Screening Questions width %
    answerWidth: 70, // Vendor Selection width %
    topHeight: 35, // Top section height %
    activitiesWidth: 40, // Campaign Basics width %
    sourcesWidth: 28 // Campaign Scope width % (reduced from 40%)
    // Team Members gets the remaining width (32%)
  });

  // Extract individual values for backward compatibility
  const { chatWidth, answerWidth, topHeight, activitiesWidth, sourcesWidth } = panelSizing;
  
  // Setters for individual values
  const setChatWidth = (value: number) => setPanelSizing(prev => ({ ...prev, chatWidth: value }));
  const setAnswerWidth = (value: number) => setPanelSizing(prev => ({ ...prev, answerWidth: value }));
  const setTopHeight = (value: number) => setPanelSizing(prev => ({ ...prev, topHeight: value }));
  const setActivitiesWidth = (value: number) => setPanelSizing(prev => ({ ...prev, activitiesWidth: value }));
  const setSourcesWidth = (value: number) => setPanelSizing(prev => ({ ...prev, sourcesWidth: value }));

  // Form completion states
  const [campaignBasicsCompleted, setCampaignBasicsCompleted] = useState<boolean>(false);
  const [scopeRefinementCompleted, setScopeRefinementCompleted] = useState<boolean>(false);

  // Reset form completion states when starting a new campaign
  useEffect(() => {
    if (isNewCampaign) {
      setCampaignBasicsCompleted(false);
      setScopeRefinementCompleted(false);
    }
  }, [isNewCampaign]);

  // Form completion handlers
  const handleCampaignBasicsChange = (isCompleted: boolean) => {
    setCampaignBasicsCompleted(isCompleted);
  };

  const handleScopeRefinementChange = (isCompleted: boolean) => {
    setScopeRefinementCompleted(isCompleted);
  };

  // Additional data handlers for other panels
  const handleTeamMembersChange = (data: unknown) => {
    handleCampaignDataChange({ teamMembers: data as unknown[] });
  };

  const handleScreeningQuestionsChange = (data: unknown) => {
    handleCampaignDataChange({ screeningQuestions: data as unknown[] });
  };

  const handleVendorSelectionChange = (data: unknown) => {
    handleCampaignDataChange({ selectedVendors: data as string[] });
  };

  // Campaign data handlers
  const handleCampaignDataChange = (data: Partial<CampaignData>) => {
    console.log('Campaign data change:', data);
    setCampaignData((prev: CampaignData | null) => {
      if (!prev) {
        return data as CampaignData;
      }
      const updated = {
        ...prev,
        ...data
      } as CampaignData;
      console.log('Updated campaign data:', updated);
      return updated;
    });
  };

  const handleSaveCampaign = async () => {
    try {
      // Ensure all current form data is saved before proceeding
      console.log('=== CAMPAIGN SAVE DEBUG ===');
      console.log('Current campaign data before save:', campaignData);
      
      // Verify all required data fields are present
      if (campaignData) {
        console.log('Campaign Basics:', {
          campaignName: campaignData.campaignName,
          projectCode: campaignData.projectCode,
          industryVertical: campaignData.industryVertical,
          briefDescription: campaignData.briefDescription,
          expandedDescription: campaignData.expandedDescription
        });
        console.log('Campaign Scope:', {
          targetRegions: campaignData.targetRegions,
          startDate: campaignData.startDate,
          targetCompletionDate: campaignData.targetCompletionDate,
          estimatedCalls: campaignData.estimatedCalls
        });
        console.log('Team Members:', campaignData.teamMembers);
        console.log('Screening Questions:', campaignData.screeningQuestions);
        console.log('Selected Vendors:', campaignData.selectedVendors);
      }
      
      const campaignId = await saveCampaign();
      // Navigate to the campaign settings page after creation
      router.push(`/campaign/${campaignId}/settings`);
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  // Vendor panel focus handler (no auto-save - campaigns are created via explicit button click)
  const handleVendorPanelFocus = () => {
    // This handler is kept for potential future use but doesn't auto-save
    // Campaigns should only be created when the user clicks "Create Campaign" button
    console.log('Vendor panel focused - waiting for user to click Create Campaign');
  };

  // Navigation handlers (temporarily unused)
  const _handleNavigateToSettings = () => {
    if (campaignData?.id) {
      router.push(`/campaign/${campaignData.id}/settings`);
    }
  };

  const _handleNavigateToExperts = () => {
    if (campaignData?.id) {
      router.push(`/campaign/${campaignData.id}/experts`);
    }
  };

  const _handleNavigateToInterviews = () => {
    if (campaignData?.id) {
      router.push(`/campaign/${campaignData.id}/interviews`);
    }
  };

  // Get campaign name for display
  const getCampaignName = () => {
    if (isNewCampaign) return "New Campaign";
    return campaignData?.campaignName || "Campaign";
  };

  // Check if we're in a campaign route
  const isCampaignRoute = pathname?.includes('/campaign/') && !pathname?.includes('/new');

  // Initialize campaign data for new campaigns (only if not already set by parent)
  useEffect(() => {
    if (isNewCampaign && !campaignData) {
      setCampaignData({
        campaignName: "",
        projectCode: "",
        industryVertical: "Any",
        customIndustry: "",
        briefDescription: "",
        expandedDescription: "",
        targetRegions: [],
        startDate: "Any",
        targetCompletionDate: "Any",
        estimatedCalls: 10,
        teamMembers: [],
        screeningQuestions: [],
        selectedVendors: [],
        proposedExperts: []
      });
    }
  }, [isNewCampaign, campaignData, setCampaignData]);

  // Dragging states
  const [draggingChatAnswer, setDraggingChatAnswer] = useState<boolean>(false);
  const [draggingInternal, setDraggingInternal] = useState<boolean>(false);
  const [draggingInternal2, setDraggingInternal2] = useState<boolean>(false);
  const [draggingHorizontal, setDraggingHorizontal] = useState<boolean>(false);

  const centerBottomRef = useRef<HTMLDivElement | null>(null);

  const collapseThresholdPct = 5;

  // Collapse states
  const chatCollapsed = chatWidth <= collapseThresholdPct;
  const answerCollapsed = answerWidth <= collapseThresholdPct;
  const topCollapsed = topHeight <= collapseThresholdPct;
  const bottomCollapsed = topHeight >= 100 - collapseThresholdPct;

  // Internal panel collapse states
  const activitiesCollapsed = activitiesWidth <= 3;
  const sourcesCollapsed = sourcesWidth <= 3;
  const teamMembersCollapsed = (100 - activitiesWidth - sourcesWidth) <= 3;

  // Screening Questions/Vendor Selection divider
  const onMouseDownChatAnswerDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingChatAnswer(true);
  }, []);

  useEffect(() => {
    function onMoveChatAnswer(e: MouseEvent) {
      if (!draggingChatAnswer || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Calculate new chat width based on divider position
      const newChatPct = Math.max(0, Math.min(100, (x / rect.width) * 100));

      // Calculate answer width from remaining space
      const newAnswerWidth = 100 - newChatPct;

      setChatWidth(Math.max(0, newChatPct));
      setAnswerWidth(Math.max(0, newAnswerWidth));
    }
    function onUpChatAnswer() {
      if (draggingChatAnswer) setDraggingChatAnswer(false);
    }
    if (draggingChatAnswer) {
      window.addEventListener("mousemove", onMoveChatAnswer);
      window.addEventListener("mouseup", onUpChatAnswer);
    }
    return () => {
      window.removeEventListener("mousemove", onMoveChatAnswer);
      window.removeEventListener("mouseup", onUpChatAnswer);
    };
  }, [draggingChatAnswer]);

  // Internal divider (Campaign Basics | Campaign Scope)
  const onMouseDownInternalDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingInternal(true);
  }, []);

  useEffect(() => {
    function onMoveInternal(e: MouseEvent) {
      if (!draggingInternal || !centerBottomRef.current) return;
      const rect = centerBottomRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Calculate the total position percentage across all three sections
      const totalPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      // Ensure minimum widths for all sections
      const minWidth = 10;
      const maxActivitiesWidth = 100 - sourcesWidth - minWidth;
      
      // Calculate activities width based on total position
      const newActivitiesWidth = Math.max(minWidth, Math.min(maxActivitiesWidth, totalPct));
      
      setActivitiesWidth(newActivitiesWidth);
    }
    function onUpInternal() {
      if (draggingInternal) setDraggingInternal(false);
    }
    if (draggingInternal) {
      window.addEventListener("mousemove", onMoveInternal);
      window.addEventListener("mouseup", onUpInternal);
    }
    return () => {
      window.removeEventListener("mousemove", onMoveInternal);
      window.removeEventListener("mouseup", onUpInternal);
    };
  }, [draggingInternal, sourcesWidth]);

  // Internal divider 2 (Campaign Scope | Team Members)
  const onMouseDownInternalDivider2 = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingInternal2(true);
  }, []);

  useEffect(() => {
    function onMoveInternal2(e: MouseEvent) {
      if (!draggingInternal2 || !centerBottomRef.current) return;
      const rect = centerBottomRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Calculate the total position percentage across all three sections
      const totalPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      // Ensure minimum widths for all sections
      const minWidth = 10;
      const maxSourcesWidth = 100 - activitiesWidth - minWidth;
      
      // Calculate sources width based on total position
      const newSourcesWidth = Math.max(minWidth, Math.min(maxSourcesWidth, totalPct - activitiesWidth));
      
      setSourcesWidth(newSourcesWidth);
    }
    function onUpInternal2() {
      if (draggingInternal2) setDraggingInternal2(false);
    }
    if (draggingInternal2) {
      window.addEventListener("mousemove", onMoveInternal2);
      window.addEventListener("mouseup", onUpInternal2);
    }
    return () => {
      window.removeEventListener("mousemove", onMoveInternal2);
      window.removeEventListener("mouseup", onUpInternal2);
    };
  }, [draggingInternal2, activitiesWidth]);

  // Horizontal divider (Top section | Bottom section)
  const onMouseDownHorizontalDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingHorizontal(true);
  }, []);

  useEffect(() => {
    function onMoveHorizontal(e: MouseEvent) {
      if (!draggingHorizontal || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      
      // Calculate percentage with proper bounds
      // Ensure minimum height for both sections (at least 5% each)
      const minTopHeight = 5;
      const maxTopHeight = 95;
      const pct = Math.max(minTopHeight, Math.min(maxTopHeight, (y / rect.height) * 100));
      
      // Debug logging (remove in production)
      console.log('Horizontal drag:', { y, rectHeight: rect.height, pct, topHeight });
      
      setTopHeight(pct);
    }
    function onUpHorizontal() {
      if (draggingHorizontal) setDraggingHorizontal(false);
    }
    if (draggingHorizontal) {
      window.addEventListener("mousemove", onMoveHorizontal);
      window.addEventListener("mouseup", onUpHorizontal);
    }
    return () => {
      window.removeEventListener("mousemove", onMoveHorizontal);
      window.removeEventListener("mouseup", onUpHorizontal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingHorizontal]); // topHeight is intentionally omitted - used in callbacks

  // Get current tab based on pathname
  const getCurrentTab = () => {
    if (pathname?.includes('/settings')) return 'settings';
    if (pathname?.includes('/experts')) return 'experts';
    if (pathname?.includes('/interviews')) return 'interviews';
    return 'settings';
  };

  return (
    <main className="h-screen flex flex-col bg-light-background dark:bg-dark-background">
      <WorkspaceHeader 
        campaignName={getCampaignName()}
        campaignId={campaignData?.id}
        currentTab={getCurrentTab()}
      />

      {/* Main Workspace with margins */}
      <div className="flex-1 px-2 py-2 overflow-hidden ml-[48px]" style={{ width: `calc(100vw - 48px)` }} ref={containerRef}>
        <div className="h-full flex flex-col gap-px">
          
          {/* Top Section: Campaign Basics | Campaign Scope (100% width) */}
          {topCollapsed ? (
            <button
              className="h-7 w-full shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border-y border-light-border dark:border-dark-border rounded-none"
              title="Expand Campaign & Scope"
              onClick={() => setTopHeight(35)}
            >
              <span className="text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary leading-none">
                Campaign & Scope
              </span>
            </button>
          ) : (
            <div style={bottomCollapsed ? {} : { height: `${topHeight}%` }} className={bottomCollapsed ? "flex-1 min-h-0 w-full" : "w-full"}>
              <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
                <div className="flex-1 min-h-0 flex gap-1" ref={centerBottomRef}>
                  {/* Campaign Basics */}
                  {activitiesCollapsed ? (
                    <button
                      className="w-7 shrink-0 h-full flex items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded"
                      title="Expand Campaign Basics"
                      onClick={() => setActivitiesWidth(40)}
                    >
                      <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Campaign
                      </span>
                    </button>
                  ) : (
                    <div style={{ width: `${activitiesWidth}%` }}>
                      <CampaignBasicsPanel 
                        onFormChange={handleCampaignBasicsChange}
                        onDataChange={(data) => handleCampaignDataChange(data)}
                      />
                    </div>
                  )}

                  {/* Internal Divider Handle (Campaign Basics | Campaign Scope) */}
                  <div
                    className="w-[6px] shrink-0 relative cursor-col-resize select-none group mx-2"
                    onMouseDown={onMouseDownInternalDivider}
                  >
                    {/* Visible divider line */}
                    <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[2px] bg-primary-500/50 dark:bg-primary-500 rounded" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1in] w-[10px] rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex items-center justify-center z-10">
                      <GripVertical className="h-3 w-3 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500" />
                    </div>
                  </div>

                  {/* Campaign Scope */}
                  {sourcesCollapsed ? (
                    <button
                      className="w-7 shrink-0 h-full flex items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded"
                      title="Expand Campaign Scope"
                      onClick={() => setSourcesWidth(28)}
                    >
                      <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Scope
                      </span>
                    </button>
                  ) : (
                    <div style={{ width: `${sourcesWidth}%` }}>
                      <ScopeRefinementPanel 
                        onFormChange={handleScopeRefinementChange}
                        onDataChange={(data) => handleCampaignDataChange(data)}
                      />
                    </div>
                  )}

                  {/* Internal Divider Handle 2 (Campaign Scope | Team Members) */}
                  <div
                    className="w-[6px] shrink-0 relative cursor-col-resize select-none group mx-2"
                    onMouseDown={onMouseDownInternalDivider2}
                  >
                    {/* Visible divider line */}
                    <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[2px] bg-primary-500/50 dark:bg-primary-500 rounded" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1in] w-[10px] rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex items-center justify-center z-10">
                      <GripVertical className="h-3 w-3 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500" />
                    </div>
                  </div>

                  {/* Team Members */}
                  {teamMembersCollapsed ? (
                    <button
                      className="w-7 shrink-0 h-full flex items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded"
                      title="Expand Team Members"
                      onClick={() => {
                        setActivitiesWidth(40);
                        setSourcesWidth(28);
                      }}
                    >
                      <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Team
                      </span>
                    </button>
                  ) : (
                    <div style={{ width: `${100 - activitiesWidth - sourcesWidth}%` }}>
                      <TeamMembersPanel onDataChange={handleTeamMembersChange} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Horizontal Divider Handle */}
          <div
            className="h-[6px] w-full relative cursor-row-resize select-none group flex items-center justify-center"
            onMouseDown={onMouseDownHorizontalDivider}
          >
            <div className="h-[10px] w-[1in] rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex items-center justify-center">
              <GripHorizontal className="h-3 w-3 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500" />
            </div>
          </div>

          {/* Bottom Section: Screening Questions (30%) | Vendor Selection (70%) */}
          {bottomCollapsed ? (
            <button
              className="h-7 w-full shrink-0 mt-auto flex items-center justify-center bg-light-surface dark:bg-dark-surface border-y border-light-border dark:border-dark-border rounded-none"
              title="Expand Screening & Vendor Selection"
              onClick={() => setTopHeight(35)}
            >
              <span className="text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary leading-none">
                Screening & Vendor Selection
              </span>
            </button>
          ) : (
            <div style={{ height: `${100 - topHeight}%` }} className="w-full flex gap-px">
              {/* Screening Questions Panel */}
              {chatCollapsed ? (
                <button
                  className="w-7 shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                  title="Expand Screening Questions"
                  onClick={() => setChatWidth(30)}
                >
                  <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                    Screening
                  </span>
                </button>
              ) : (
                <div style={{ width: `${chatWidth}%` }} className="h-full">
                  <ScreeningQuestionsPanel onDataChange={handleScreeningQuestionsChange} />
                </div>
              )}

              {/* Screening Questions/Vendor Selection Divider Handle */}
              <div
                className="w-[6px] shrink-0 relative cursor-col-resize select-none group flex items-center justify-center"
                onMouseDown={onMouseDownChatAnswerDivider}
              >
                <div className="h-[1in] w-[10px] rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex items-center justify-center">
                  <GripVertical className="h-3 w-3 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-primary-500" />
                </div>
              </div>

              {/* Vendor Selection Panel */}
              {answerCollapsed ? (
                <button
                  className="w-7 shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                  title="Expand Vendor Selection"
                  onClick={() => setAnswerWidth(70)}
                >
                  <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                    Vendor Selection
                  </span>
                </button>
              ) : (
                <div style={{ width: `${answerWidth}%` }} className="h-full">
                  <VendorSelectionPanel 
                    isConfirmButtonEnabled={campaignBasicsCompleted && scopeRefinementCompleted}
                    onSaveCampaign={handleSaveCampaign}
                    onDataChange={handleVendorSelectionChange}
                    onPanelFocus={handleVendorPanelFocus}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
