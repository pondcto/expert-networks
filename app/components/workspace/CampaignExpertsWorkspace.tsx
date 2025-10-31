"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { useCampaign } from "../../lib/campaign-context";
import { usePathname } from "next/navigation";
import { WorkspaceHeader } from "../layout";
import { PanelSizing } from "../../types";
import { ProposedExpert, mockProposedExperts } from "../../data/mockData";
import CampaignMetricsCardPanel from "./CampaignMetricsCardPanel";
import ProposedExpertsPanel from "./ProposedExpertsPanel";
import ExpertDetailsPanel from "./ExpertDetailsPanel";
import ExpertSchedulingPanel from "./ExpertSchedulingPanel";

export default function CampaignExpertsWorkspace() {
  const { campaignData, setCampaignData, isNewCampaign } = useCampaign();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel sizing states using optimized type
  const [panelSizing, setPanelSizing] = useState<PanelSizing>({
    chatWidth: 50, // Proposed Experts width %
    answerWidth: 50, // Expert Details width %
    topHeight: 35, // Top section height %
    activitiesWidth: 0, // Not used in this workspace
    sourcesWidth: 0 // Not used in this workspace
  });

  // Selected expert state
  const [selectedExpert, setSelectedExpert] = useState<ProposedExpert | null>(null);

  // Extract individual values for backward compatibility
  const { chatWidth, answerWidth, topHeight } = panelSizing;
  
  // Setters for individual values
  const setChatWidth = (value: number) => setPanelSizing(prev => ({ ...prev, chatWidth: value }));
  const setAnswerWidth = (value: number) => setPanelSizing(prev => ({ ...prev, answerWidth: value }));
  const setTopHeight = (value: number) => setPanelSizing(prev => ({ ...prev, topHeight: value }));

  // Get campaign name for display
  const getCampaignName = () => {
    if (isNewCampaign) return "New Campaign";
    return campaignData?.campaignName || "Campaign";
  };

  // Initialize campaign data for new campaigns
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
        selectedVendors: []
      });
    }
  }, [isNewCampaign, campaignData, setCampaignData]);

  // Initialize default selected expert to the first proposed expert
  useEffect(() => {
    if (!selectedExpert && mockProposedExperts && mockProposedExperts.length > 0) {
      setSelectedExpert(mockProposedExperts[0]);
    }
  }, [selectedExpert]);

  // Dragging states
  const [draggingChatAnswer, setDraggingChatAnswer] = useState<boolean>(false);
  const [draggingHorizontal, setDraggingHorizontal] = useState<boolean>(false);


  const collapseThresholdPct = 5;

  // Collapse states
  const chatCollapsed = chatWidth <= collapseThresholdPct;
  const answerCollapsed = answerWidth <= collapseThresholdPct;
  const topCollapsed = topHeight <= collapseThresholdPct;
  const bottomCollapsed = topHeight >= 100 - collapseThresholdPct;


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
    return 'experts';
  };

  return (
    <main className="h-screen flex flex-col bg-light-background dark:bg-dark-background">
      <WorkspaceHeader 
        campaignName={getCampaignName()}
        campaignId={campaignData?.id}
        currentTab={getCurrentTab()}
      />
      
      <CampaignMetricsCardPanel />
      {/* Main Workspace with margins */}
      <div className="flex-1 px-2 py-2 overflow-hidden ml-[48px]" style={{ width: `calc(100vw - 48px)` }} ref={containerRef}>
        <div className="h-full flex flex-col gap-px">
          
          {/* Top Section: Proposed Experts | Campaign Scope (100% width) */}
          {topCollapsed ? (
            <button
              className="h-7 w-full shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border-y border-light-border dark:border-dark-border rounded-none"
              title="Expand Proposed Experts"
              onClick={() => setTopHeight(35)}
            >
              <span className="text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary leading-none">
                Proposed Experts
              </span>
            </button>
          ) : (
              <div style={bottomCollapsed ? {} : { height: `${topHeight}%` }} className={bottomCollapsed ? "flex-1 min-h-0 w-full" : "w-full"}>
                <ProposedExpertsPanel onExpertSelect={setSelectedExpert} selectedExpertId={selectedExpert?.id ?? null} />
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

          {/* Bottom Section: Screening Questions (50%) | Vendor Selection (50%) */}
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
            {/* Expert Details Panel */}
            {chatCollapsed ? (
              <button
                className="w-7 shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                title="Expand Screening Questions"
                onClick={() => setChatWidth(50)}
              >
                <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                    Expert Details
                </span>
              </button>
            ) : (
              <div style={{ width: `${chatWidth}%` }} className="h-full">
                <ExpertDetailsPanel selectedExpert={selectedExpert} />
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

            {/* Expert Scheduling Panel */}
            {answerCollapsed ? (
              <button
                className="w-7 shrink-0 flex items-center justify-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                title="Expand Vendor Selection"
                onClick={() => setAnswerWidth(50)}
              >
                <span className="[writing-mode:vertical-rl] rotate-180 text-body-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  Expert Scheduling
                </span>
              </button>
            ) : (
              <div style={{ width: `${answerWidth}%` }} className="h-full">
                <ExpertSchedulingPanel selectedExpert={selectedExpert} />
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
