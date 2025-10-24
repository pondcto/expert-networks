"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import CampaignSettingsWorkspace from "../../components/workspace/CampaignSettingsWorkspace";
import { AppSidebar } from "../../components/app-sidebar";
import { SidebarInset } from "../../components/ui/sidebar";

function CampaignContent({ campaignId }: { campaignId: string }) {
  // TODO: Load campaign data based on campaignId
  // const { data: campaign } = useCampaign(campaignId);
  
  return (
    <div className="h-full">
      {/* Campaign header could go here */}
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <h1 className="text-title font-semibold text-light-text dark:text-dark-text">
          Campaign: {campaignId}
        </h1>
      </div>
      
      {/* Expert Networks Workspace */}
      <CampaignSettingsWorkspace />
    </div>
  );
}

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-body text-light-text dark:text-dark-text">
            Loading campaign...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <CampaignContent campaignId={campaignId} />
        </SidebarInset>
      </div>
    </Suspense>
  );
}
