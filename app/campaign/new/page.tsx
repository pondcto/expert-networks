"use client";

import { Suspense, useEffect } from "react";
import CampaignSettingsWorkspace from "../../components/workspace/CampaignSettingsWorkspace";
import { AppSidebar } from "../../components/app-sidebar";
import { SidebarInset } from "../../components/ui/sidebar";
import { useCampaign } from "../../lib/campaign-context";

function NewCampaignContent() {
  const { setIsNewCampaign, setCampaignData } = useCampaign();

  // Reset all form data when navigating to new campaign
  useEffect(() => {
    // Set as new campaign
    setIsNewCampaign(true);
    
    // Reset campaign data to default state
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
      minCalls: 5,
      maxCalls: 15,
      teamMembers: [],
      screeningQuestions: [],
      selectedVendors: [],
      proposedExperts: []
    });
    
    console.log('Form data reset for new campaign');
  }, [setIsNewCampaign, setCampaignData]);

  return <CampaignSettingsWorkspace key="new-campaign" />;
}

export default function NewCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-body text-light-text dark:text-dark-text">
            Loading new campaign...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <NewCampaignContent />
        </SidebarInset>
      </div>
    </Suspense>
  );
}
