"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CampaignData {
  id?: string;
  campaignName: string;
  projectCode: string;
  industryVertical: string;
  customIndustry?: string;
  briefDescription: string;
  expandedDescription: string;
  targetRegions: string[];
  startDate: string;
  targetCompletionDate: string;
  estimatedCalls?: number; // Keep for backward compatibility
  minCalls?: number;
  maxCalls?: number;
  teamMembers: unknown[];
  screeningQuestions: unknown[];
  selectedVendors: string[];
  proposedExperts?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

interface CampaignContextType {
  campaignData: CampaignData | null;
  setCampaignData: (data: CampaignData | ((prev: CampaignData | null) => CampaignData)) => void;
  saveCampaign: (dataToSave?: Partial<CampaignData>) => Promise<string>;
  loadCampaign: (campaignId: string) => Promise<void>;
  isNewCampaign: boolean;
  setIsNewCampaign: (isNew: boolean) => void;
  refreshCampaigns: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isNewCampaign, setIsNewCampaign] = useState(true);

  // Generate a 16-digit hexadecimal campaign ID
  const generateCampaignId = (): string => {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // Memoize saveCampaign to prevent infinite loops in components that depend on it
  const saveCampaign = useCallback(async (dataToSave?: Partial<CampaignData>): Promise<string> => {
    // Merge the provided data with current campaign data
    const mergedData = dataToSave 
      ? { ...campaignData, ...dataToSave } as CampaignData
      : campaignData;

    if (!mergedData) {
      throw new Error('No campaign data to save');
    }

    const now = new Date().toISOString();
    const campaignId = mergedData.id || generateCampaignId();
    const campaignToSave = {
      ...mergedData,
      id: campaignId,
      createdAt: mergedData.createdAt || now,
      updatedAt: now,
    };

    // In a real app, this would save to a database
    // For now, we'll save to localStorage
    console.log('Saving campaign data to localStorage:', campaignToSave);
    localStorage.setItem(`campaign_${campaignId}`, JSON.stringify(campaignToSave));
    
    // Verify the data was saved correctly
    const savedData = localStorage.getItem(`campaign_${campaignId}`);
    console.log('Verified saved data:', savedData ? JSON.parse(savedData) : 'No data found');
    
    setCampaignData(campaignToSave);
    setIsNewCampaign(false);
    
    // Dispatch custom event to notify sidebar of new campaign
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campaignSaved', { 
        detail: { campaignId, campaignName: campaignToSave.campaignName } 
      }));
    }
    
    return campaignId;
  }, [campaignData]);

  // Memoize loadCampaign to prevent infinite loops in components that depend on it
  const loadCampaign = useCallback(async (campaignId: string): Promise<void> => {
    try {
      // In a real app, this would load from a database
      // For now, we'll load from localStorage
      const savedData = localStorage.getItem(`campaign_${campaignId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCampaignData(parsedData);
        setIsNewCampaign(false);
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
    }
  }, []);

  const refreshCampaigns = () => {
    // This is a placeholder for refreshing campaign list
    // In a real app, this might trigger a re-fetch from the database
    // For now, it's just a no-op since the sidebar handles its own refresh
  };

  return (
    <CampaignContext.Provider
      value={{
        campaignData,
        setCampaignData,
        saveCampaign,
        loadCampaign,
        isNewCampaign,
        setIsNewCampaign,
        refreshCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
