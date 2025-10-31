"use client";
import React from "react";
import { useCampaign, CampaignData } from "../../lib/campaign-context";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { mockProposedExperts } from "../../data/mockData";

interface ExtendedCampaignData extends CampaignData {
    completedCalls?: number;
    scheduledCalls?: number;
    scopeRefinement?: {
        numberOfCalls?: {
            min?: number;
            max?: number;
        };
    };
}

export default function CostBreakdownPanel() {
    const { campaignData } = useCampaign();
    
    // Get estimated calls (target) - exactly matching dashboard logic
    const getEstimatedCalls = (c: ExtendedCampaignData | null): number => {
        if (!c) return 0;
        if (c.minCalls !== undefined && c.maxCalls !== undefined) {
            return Math.round((c.minCalls + c.maxCalls) / 2);
        }
        return c.estimatedCalls || 0;
    };
    
    const campaign = campaignData as ExtendedCampaignData | null;
    const targetCalls = getEstimatedCalls(campaign);
    const performedCalls = Math.max(0, Math.min((campaign?.completedCalls ?? 0), targetCalls));
    const scheduledCalls = Math.max(0, Math.min((campaign?.scheduledCalls ?? 0), Math.max(0, targetCalls - performedCalls)));
    const remainderCalls = Math.max(0, targetCalls - performedCalls - scheduledCalls);
    
    // Calculate percentages
    const performedPct = targetCalls > 0 ? (performedCalls / targetCalls) * 100 : 0;
    const scheduledPct = targetCalls > 0 ? (scheduledCalls / targetCalls) * 100 : 0;
    const remainderPct = targetCalls > 0 ? (remainderCalls / targetCalls) * 100 : 0;
    
    // Calculate anchored cost
    const avgCostPerCall = 1000;
    const anchoredCost = (performedCalls + scheduledCalls) * avgCostPerCall;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between shrink-0 px-3 pt-3 pb-2">
                <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                    Cost Breakdown
                </h3>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 flex flex-col">
                {/* Top Metrics - More compact */}
                <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-500 mb-0.5">
                            {performedCalls}
                        </div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary leading-tight">
                            Interviews completed
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-300 dark:text-primary-300 mb-0.5">
                            {scheduledCalls}
                        </div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary leading-tight">
                            Interviews scheduled
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text mb-0.5">
                            ${(anchoredCost / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary leading-tight">
                            Anchored cost
                        </div>
                    </div>
                </div>

                {/* Expert Types - Domain Experts, Customers, Competitors, Other - More compact */}
                <div className="mb-4 shrink-0">
                    {(() => {
                        // Use actual expert count from mock data or campaign data
                        const proposedExpertsCount = Array.isArray(campaign?.proposedExperts) && campaign.proposedExperts.length > 0
                            ? campaign.proposedExperts.length 
                            : mockProposedExperts.length;
                        
                        // Categorize experts - distribute across types
                        // In a real implementation, each expert would have an expertType field
                        // For now, using distribution: ~40% Domain Experts, ~25% Customers, ~20% Competitors, ~15% Other
                        const domainExpertsCount = Math.round(proposedExpertsCount * 0.40);
                        const customersCount = Math.round(proposedExpertsCount * 0.25);
                        const competitorsCount = Math.round(proposedExpertsCount * 0.20);
                        const otherCount = Math.max(0, proposedExpertsCount - domainExpertsCount - customersCount - competitorsCount);
                        
                        const expertTypes = [
                            { count: domainExpertsCount, label: 'Domain Experts' },
                            { count: customersCount, label: 'Customers' },
                            { count: competitorsCount, label: 'Competitors' },
                            { count: otherCount, label: 'Other' }
                        ];
                        
                        if (proposedExpertsCount === 0) {
                            return (
                                <div className="py-1.5">
                                    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary italic">
                                        No experts available
                                    </div>
                                </div>
                            );
                        }
                        
                        return (
                            <div className="space-y-0.5">
                                {expertTypes.map((type, index) => (
                                    <div 
                                        key={index} 
                                        className="py-1.5 border-b border-light-border/50 dark:border-dark-border/50 last:border-b-0"
                                    >
                                        <div className="text-sm text-light-text dark:text-dark-text">
                                            <span className="font-semibold">{type.count}</span>{' '}
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">{type.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Calls Progress Bar - Pinned to bottom when expanded */}
                <div className="mt-auto pt-4 shrink-0">
                    <div className="mb-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div 
                                    className="w-full bg-light-background-secondary dark:bg-dark-background-tertiary rounded-full h-5 flex overflow-hidden cursor-help"
                                >
                                    <div 
                                        className="h-5 bg-primary-500 transition-all"
                                        style={{ width: `${performedPct}%` }}
                                    />
                                    <div 
                                        className="h-5 bg-primary-300 transition-all"
                                        style={{ width: `${scheduledPct}%` }}
                                    />
                                    <div 
                                        className="h-5 bg-gray-300 dark:bg-gray-600 transition-all"
                                        style={{ width: `${remainderPct}%` }}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent 
                                side="top" 
                                className="bg-gray-900 dark:bg-gray-700 text-white border-none"
                            >
                                <div className="text-xs">
                                    <span className="text-primary-400">{performedCalls} performed</span>
                                    {" / "}
                                    <span className="text-primary-300">{scheduledCalls} scheduled</span>
                                    {" / "}
                                    <span>{targetCalls} target</span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Legend - More compact */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-primary-500 rounded-sm flex-shrink-0"></div>
                            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">
                                {performedCalls} performed
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-primary-300 rounded-sm flex-shrink-0"></div>
                            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">
                                {scheduledCalls} scheduled
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-sm flex-shrink-0"></div>
                            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">
                                {remainderCalls} to target
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}