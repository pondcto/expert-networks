"use client";

import { ThemeProvider } from "./theme-provider";
import { AssistantProvider, FloatingAssistant } from "../components/assistant";
import { SidebarProvider } from "../components/ui/sidebar";
import { NavigationProvider } from "../components/navigation-context";
import { CampaignProvider } from "../lib/campaign-context";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <CampaignProvider>
          <SidebarProvider>
            <AssistantProvider config={{ apiBaseUrl: "/api/assistant" }}>
              {children}
              <FloatingAssistant />
            </AssistantProvider>
          </SidebarProvider>
        </CampaignProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}
