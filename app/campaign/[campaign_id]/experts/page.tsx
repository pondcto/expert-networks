"use client";

import { Suspense, useEffect } from "react";
import { useParams } from "next/navigation";
import CampaignExpertsWorkspace from "../../../components/workspace/CampaignExpertsWorkspace";
import { AppSidebar } from "../../../components/app-sidebar";
import { SidebarInset } from "../../../components/ui/sidebar";
import { useCampaign } from "../../../lib/campaign-context";

function CampaignExpertsContent({ campaignId }: { campaignId: string }) {
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
      <CampaignExpertsWorkspace />
    </div>
  );
}

export default function CampaignExpertsPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-body text-light-text dark:text-dark-text">
            Loading campaign experts...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <CampaignExpertsContent campaignId={campaignId} />
        </SidebarInset>
      </div>
    </Suspense>
  );
}
