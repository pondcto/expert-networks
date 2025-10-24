"use client";

import React, { useState } from "react";
import Image from "next/image";
import { mockProposedExperts, mockVendors, ProposedExpert, Vendor } from "../../lib/mockData";
import { EyeIcon } from "lucide-react";

interface ProposedExpertsPanelProps {
  onExpertSelect?: (expert: ProposedExpert) => void;
  selectedExpertId?: string | null;
}

export default function ProposedExpertsPanel({ onExpertSelect, selectedExpertId }: ProposedExpertsPanelProps) {
  const [selectedExperts, setSelectedExperts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const getVendorById = (vendorId: string): Vendor | undefined => {
    return mockVendors.find(vendor => vendor.id === vendorId);
  };

  const _handleExpertSelect = (expertId: string) => {
    const newSelected = new Set(selectedExperts);
    if (newSelected.has(expertId)) {
      newSelected.delete(expertId);
    } else {
      newSelected.add(expertId);
    }
    setSelectedExperts(newSelected);
    setSelectAll(newSelected.size === mockProposedExperts.length);
  };

  const _handleSelectAll = () => {
    if (selectAll) {
      setSelectedExperts(new Set());
      setSelectAll(false);
    } else {
      setSelectedExperts(new Set(mockProposedExperts.map(expert => expert.id)));
      setSelectAll(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "bg-green-100 text-green-800";
      case "Awaiting Review":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const getAiFitScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500 text-white";
    if (score >= 7) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const handleRowClick = (expert: ProposedExpert) => {
    if (onExpertSelect) {
      onExpertSelect(expert);
    }
  };

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Proposed Experts
        </h3>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border z-10">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[3vw]">#</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[15vw]">Expert</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[10vw]">Vendor</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[40vw]">History</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[8vw]">Rating</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[8vw]">AI fit score</th>
                <th className="text-left p-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary w-[10vw]">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockProposedExperts.map((expert) => (
                <tr 
                  key={expert.id} 
                  className={`border-b border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer ${
                    selectedExpertId === expert.id ? "bg-primary-50 dark:bg-primary-800" : ""
                  }`}
                  onClick={() => handleRowClick(expert)}
                >
                  <td className="p-1 text-sm text-light-text dark:text-dark-text">
                    #{expert.number}
                  </td>
                  <td className="p-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Image src={expert.avatar} alt={expert.name} width={40} height={40} />
                          </div>
                          {expert.isNew && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-0.5 rounded">
                              New
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-light-text dark:text-dark-text">{expert.name}</div>
                        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{expert.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-1">
                    {(() => {
                      const vendor = getVendorById(expert.vendor_id);
                      return vendor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Image src={vendor.logo} alt={vendor.name} width={24} height={24} className="object-contain" />
                          </div>
                          <span className="text-sm font-medium text-light-text dark:text-dark-text">{vendor.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {expert.company}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-1 text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-xs">
                    <div className="relative group">
                      <div className="truncate cursor-help">{expert.history}</div>
                      <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal z-20 shadow-lg max-w-md">
                        {expert.history}
                      </div>
                    </div>
                  </td>
                  <td className="p-1">
                    <div className="flex items-center gap-1 ml-3">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-light-text dark:text-dark-text">{expert.rating}</span>
                    </div>
                  </td>
                  <td className="p-1">
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAiFitScoreColor(expert.aiFitScore)}`}>
                        {expert.aiFitScore}
                      </span>
                    </div>
                  </td>
                  <td className="p-1">
                    <span className={`inline-flex items-center justify-center w-32 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(expert.status)}`}>
                      {expert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
