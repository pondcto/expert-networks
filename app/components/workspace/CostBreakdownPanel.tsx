"use client";
import React from "react";

export default function CostBreakdownPanel() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
                    Cost Breakdown
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-3 p-3">
                {/* Interview Statistics */}
                <div className="flex justify-between mb-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-1">
                            15
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Interviews completed
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">
                            +5
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            Interviews scheduled
                        </div>
                    </div>
                </div>

                {/* Entity List */}
                <div className="mb-3">
                    <div className="py-2 border-b border-light-border dark:border-dark-border">
                        <div className="text-light-text dark:text-dark-text">7 OEMs</div>
                    </div>
                    <div className="py-2 border-b border-light-border dark:border-dark-border">
                        <div className="text-light-text dark:text-dark-text">5 Customers</div>
                    </div>
                    <div className="py-2">
                        <div className="text-light-text dark:text-dark-text">3 Customers</div>
                    </div>
                </div>

                {/* Budget Bar Chart */}
                <div className="flex-1">
                    <div className="mb-2">
                        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex">
                            {/* Completed */}
                            <div className="bg-primary-600 dark:bg-primary-500 h-full" style={{ width: '62.5%' }}></div>
                            {/* Scheduled */}
                            <div className="bg-primary-400 dark:bg-primary-400 h-full" style={{ width: '20.8%' }}></div>
                            {/* Budget (Remaining) */}
                            <div className="bg-gray-300 dark:bg-gray-600 h-full" style={{ width: '16.7%' }}></div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-600 dark:bg-primary-500 rounded-sm"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                Completed $15,000
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-400 dark:bg-primary-400 rounded-sm"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                Scheduled $5,000
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                Budget $24,000
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}