"use client";

import { Suspense, useEffect } from "react";
import { useParams } from "next/navigation";
import CampaignSettingsWorkspace from "../../../components/workspace/CampaignSettingsWorkspace";
import { AppSidebar } from "../../../components/app-sidebar";
import { SidebarInset } from "../../../components/ui/sidebar";
import { useCampaign } from "../../../lib/campaign-context";

function CampaignSettingsContent({ campaignId }: { campaignId: string }) {
  const { loadCampaign } = useCampaign();
  
  useEffect(() => {
    if (campaignId) {
      loadCampaign(campaignId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]); // loadCampaign is intentionally excluded to prevent infinite loop
  
  return (
    <div className="h-full">
      {/* Expert Networks Workspace */}
      <CampaignSettingsWorkspace />
    </div>
  );
}

export default function CampaignSettingsPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-body text-light-text dark:text-dark-text">
            Loading campaign settings...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <CampaignSettingsContent campaignId={campaignId} />
        </SidebarInset>
      </div>
    </Suspense>
  );
}
