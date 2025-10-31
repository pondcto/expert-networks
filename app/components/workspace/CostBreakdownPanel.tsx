"use client";
import React from "react";
import { useCampaign } from "../../lib/campaign-context";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function CostBreakdownPanel() {
    const { campaignData } = useCampaign();
    
    // Get estimated calls (target) - exactly matching dashboard logic
    const getEstimatedCalls = (c: any): number => {
        if (c.minCalls !== undefined && c.maxCalls !== undefined) {
            return Math.round((c.minCalls + c.maxCalls) / 2);
        }
        return c.estimatedCalls || 0;
    };
    
    const campaign = campaignData as any;
    const targetCalls = getEstimatedCalls(campaign || {});
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
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                    Cost Breakdown
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-3 p-3">
                {/* Top Metrics */}
                <div className="flex justify-between mb-6">
                    <div className="text-center flex-1">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-1">
                            {performedCalls}
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Interviews completed
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="text-3xl font-bold text-primary-300 dark:text-primary-300 mb-1">
                            {scheduledCalls}
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Interviews scheduled
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">
                            ${(anchoredCost / 1000).toFixed(0)}k
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Anchored cost
                        </div>
                    </div>
                </div>

                {/* Entity List - Using actual campaign values */}
                <div className="mb-6">
                    {(() => {
                        const proposedExpertsCount = Array.isArray(campaign?.proposedExperts) ? campaign.proposedExperts.length : 0;
                        const selectedVendorsCount = Array.isArray(campaign?.selectedVendors) ? campaign.selectedVendors.length : 0;
                        const teamMembersCount = Array.isArray(campaign?.teamMembers) ? campaign.teamMembers.length : 0;
                        
                        const items = [];
                        if (proposedExpertsCount > 0) {
                            items.push({ count: proposedExpertsCount, label: proposedExpertsCount === 1 ? 'Expert' : 'Experts', suffix: 'Proposed' });
                        }
                        if (selectedVendorsCount > 0) {
                            items.push({ count: selectedVendorsCount, label: selectedVendorsCount === 1 ? 'Vendor' : 'Vendors', suffix: 'Selected' });
                        }
                        if (teamMembersCount > 0) {
                            items.push({ count: teamMembersCount, label: `Team ${teamMembersCount === 1 ? 'Member' : 'Members'}` });
                        }
                        
                        if (items.length === 0) {
                            return (
                                <div className="py-2">
                                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
                                        No data available
                                    </div>
                                </div>
                            );
                        }
                        
                        return items.map((item, index) => (
                            <div 
                                key={index} 
                                className={`py-2 ${index < items.length - 1 ? 'border-b border-light-border dark:border-dark-border' : ''}`}
                            >
                                <div className="text-light-text dark:text-dark-text">
                                    {item.count} {item.label}{item.suffix ? ` ${item.suffix}` : ''}
                                </div>
                            </div>
                        ));
                    })()}
                </div>

                {/* Calls Progress Bar (same as dashboard) */}
                <div className="flex-1">
                    <div className="mb-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div 
                                    className="w-full bg-light-background-secondary dark:bg-dark-background-tertiary rounded-full h-6 flex overflow-hidden cursor-help"
                                >
                                    <div 
                                        className="h-6 bg-primary-500 transition-all"
                                        style={{ width: `${performedPct}%` }}
                                    />
                                    <div 
                                        className="h-6 bg-primary-300 transition-all"
                                        style={{ width: `${scheduledPct}%` }}
                                    />
                                    <div 
                                        className="h-6 bg-gray-300 dark:bg-gray-600 transition-all"
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

                    {/* Legend */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-3 h-3 bg-primary-500 rounded-sm flex-shrink-0"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap truncate">
                                {performedCalls} performed
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-3 h-3 bg-primary-300 rounded-sm flex-shrink-0"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap truncate">
                                {scheduledCalls} scheduled
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm flex-shrink-0"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap truncate">
                                {remainderCalls} to target
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}