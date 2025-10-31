"use client";

import { useCampaign } from "../../lib/campaign-context";

export default function CampaignMetricsCardPanel() {
  const { campaignData } = useCampaign();
  
  return (
    <div className="px-2 py-2 pb-0 ml-[48px]">
        <div className="grid grid-cols-7 gap-4">
            {/* Campaign Name */}
            <div className="bg-white dark:bg-gray-800 col-span-1 flex items-center justify-center rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                    {campaignData?.campaignName || "Campaign Name"}
                </div>
            </div>
            
            {/* Experts under screening */}
            <div className="bg-white col-span-1 flex justify-between items-center gap-2 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 min-w-0">
                <div className="text-md text-gray-600 dark:text-gray-400 truncate min-w-0">Experts under screening</div>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">5</div>
            </div>
            
            {/* Scheduling */}
            <div className="bg-white col-span-1 flex justify-between items-center gap-2 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 min-w-0">
                <div className="text-md text-gray-600 dark:text-gray-400 truncate min-w-0">Scheduling</div>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">5</div>
            </div>
            
            {/* Interviews scheduled */}
            <div className="bg-white col-span-1 flex justify-between items-center gap-2 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 min-w-0">
                <div className="text-md text-gray-600 dark:text-gray-400 truncate min-w-0">Interviews scheduled</div>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">5</div>
            </div>
            
            {/* Interviews completed */}
            <div className="bg-white col-span-1 flex justify-between items-center gap-2 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 min-w-0">
                <div className="text-md text-gray-600 dark:text-gray-400 truncate min-w-0">Interviews completed</div>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">15</div>
            </div>
            
            {/* Cost */}
            <div className="bg-white col-span-2 flex justify-between items-center gap-2 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 min-w-0">
                <div className="text-md text-gray-600 dark:text-gray-400 truncate min-w-0">Estimated Cost</div>
                <div className="flex items-center">
                    {/* Bar chart icon */}
                    <div className="flex justify-end h-4 gap-0.5">
                        {/* Completed Bar */}
                        <div className="relative group">
                            <div className="bg-primary-500 dark:bg-primary-600 w-[10vw] h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80"></div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                Completed: $15,000
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
                            </div>
                        </div>
                        {/* Scheduled Bar */}
                        <div className="relative group">
                            <div className="bg-primary-300 dark:bg-primary-400 w-[5vw] h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80"></div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                Scheduled: $5,000
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
                            </div>
                        </div>
                        {/* Remaining Budget Bar */}
                        <div className="relative group">
                            <div className="bg-gray-300 dark:bg-gray-600 w-[4vw] h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80"></div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                Remaining: $4,000
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}


