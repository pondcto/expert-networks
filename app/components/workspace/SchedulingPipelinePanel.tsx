"use client";
import React from "react";
import { mockProposedExperts, mockVendorPlatforms } from "../../data/mockData";

export default function SchedulingPipelinePanel() {
    // Randomly assign scheduling status for demo purposes
    const getSchedulingStatus = (index: number): "Scheduled" | "Pending" => {
        return index % 2 === 0 ? "Scheduled" : "Pending";
    };

    const getStatusStyle = (status: "Scheduled" | "Pending") => {
        if (status === "Scheduled") {
            return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700";
        } else {
            return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700";
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                    Scheduling Pipeline
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-1">
                    {mockProposedExperts.slice(0, 7).map((pe, index) => {
                        const vendor = mockVendorPlatforms.find(v => v.id === pe.vendor_id);
                        const schedulingStatus = getSchedulingStatus(index);
                        
                        return (
                            <div key={pe.id} className="flex items-center w-full gap-4 p-1 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
                                {/* Avatars */}
                                <div className="flex items-center gap-3">
                                    {vendor?.logo && (
                                        <div className="w-10 h-10 rounded overflow-hidden bg-white dark:bg-dark-surface flex items-center justify-center">
                                            <img src={vendor.logo} alt="Vendor" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                                        <img 
                                            src={pe.avatar} 
                                            alt={pe.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                
                                {/* Expert Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-light-text dark:text-dark-text truncate">
                                        {pe.name}
                                    </div>
                                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                                        {pe.title}
                                    </div>
                                </div>
                                
                                {/* Status Tag */}
                                <div>
                                    <span className={`inline-flex items-center justify-center w-24 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyle(schedulingStatus)}`}>
                                        {schedulingStatus}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}