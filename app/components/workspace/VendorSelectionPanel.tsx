"use client";

import React, { useState, useEffect } from "react";
import { Star, MapPin, X, Globe, MessageCircle, ArrowUpDown } from "lucide-react";
import { useCampaign } from "../../lib/campaign-context";
import { mockVendorPlatforms, VendorPlatform } from "../../data/mockData";
import Image from "next/image";

export interface VendorSelectionPanelProps {
  vendors?: VendorPlatform[];
  isConfirmButtonEnabled?: boolean;
  onSaveCampaign?: () => void;
  onDataChange?: (data: string[]) => void;
  onPanelFocus?: () => void;
}


export default function VendorSelectionPanel({ 
  vendors = mockVendorPlatforms, 
  isConfirmButtonEnabled = true,
  onSaveCampaign,
  onPanelFocus
}: VendorSelectionPanelProps) {
  const { isNewCampaign } = useCampaign();
  const [showVendorDetailsModal, setShowVendorDetailsModal] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorPlatform | null>(null);
  const [enrolledVendors, setEnrolledVendors] = useState<Set<string>>(new Set());
  const [showEnrollmentModal, setShowEnrollmentModal] = useState<boolean>(false);
  const [vendorToEnroll, setVendorToEnroll] = useState<VendorPlatform | null>(null);
  const [pendingVendors, setPendingVendors] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<'rank' | 'overallScore' | 'avgCostPerCall' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Initialize enrolled vendors with vendors that are already enrolled
  useEffect(() => {
    const alreadyEnrolled = vendors
      .filter(vendor => vendor.status === "Enrolled")
      .map(vendor => vendor.id);
    setEnrolledVendors(new Set(alreadyEnrolled));
  }, [vendors]);

  const handleVendorClick = (vendor: VendorPlatform) => {
    setSelectedVendor(vendor);
    setShowVendorDetailsModal(true);
  };

  const handleEnrollVendor = (e: React.MouseEvent<HTMLButtonElement>, vendor: VendorPlatform) => {
    e.stopPropagation();
    setVendorToEnroll(vendor);
    setShowEnrollmentModal(true);
  };

  const handleConfirmEnrollment = () => {
    if (vendorToEnroll) {
      setPendingVendors(prev => {
        const newSet = new Set(prev);
        newSet.add(vendorToEnroll.id);
        return newSet;
      });
      setShowEnrollmentModal(false);
      setVendorToEnroll(null);
    }
  };

  const handleCancelEnrollment = () => {
    setShowEnrollmentModal(false);
    setVendorToEnroll(null);
  };

  const handleCloseVendorDetailsModal = () => {
    setShowVendorDetailsModal(false);
    setSelectedVendor(null);
  };

  const getVendorStatus = (vendor: VendorPlatform) => {
    if (pendingVendors.has(vendor.id)) return "Pending";
    if (enrolledVendors.has(vendor.id)) return "Enrolled";
    return vendor.status;
  };

  const getStatusPillStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700";
      case "Not enrolled":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700";
      case "Enrolled":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700";
    }
  };

  const getStatusPaddingSize = (status: string) => {
    // Make "Not enrolled" text smaller to fit better in the pill
    return status === "Not enrolled" ? "px-1" : "px-3";
  };

  // Infer regions focus based on location and tags
  const getRegionsForVendor = (vendor: VendorPlatform): string[] => {
    const regions = new Set<string>();
    const loc = (vendor.location || "").toLowerCase();
    const tags = vendor.tags?.map(t => t.toLowerCase()) || [];
    if (tags.includes("global coverage") || tags.includes("global project execution")) regions.add("Global");
    if (loc.includes("usa") || loc.includes("new york") || loc.includes("chicago") || loc.includes("boston") || loc.includes("san francisco")) regions.add("North America");
    if (loc.includes("london") || loc.includes("uk") || loc.includes("greece") || loc.includes("europe")) regions.add("Europe");
    if (tags.some(t => t.includes("apac") || t.includes("asia"))) regions.add("APAC");
    if (tags.some(t => t.includes("latam") || t.includes("latin"))) regions.add("LATAM");
    if (tags.some(t => t.includes("middle east") || t.includes("mea"))) regions.add("Middle East & Africa");
    return Array.from(regions.size > 0 ? regions : new Set(["Global"]))
      .slice(0, 4);
  };

  // Infer industries based on description and tags
  const getIndustriesForVendor = (vendor: VendorPlatform): string[] => {
    const industries = new Set<string>();
    const desc = (vendor.description || "").toLowerCase();
    const tags = vendor.tags?.map(t => t.toLowerCase()) || [];
    const addIf = (cond: boolean, label: string) => { if (cond) industries.add(label); };
    addIf(desc.includes("life sciences") || desc.includes("healthcare") || tags.some(t => t.includes("life sciences") || t.includes("health")), "Healthcare");
    addIf(desc.includes("technology") || desc.includes("platform") || desc.includes("ai") || tags.some(t => t.includes("technology") || t.includes("ai")), "Technology");
    addIf(desc.includes("investment") || desc.includes("hedge") || desc.includes("equity") || desc.includes("financial") || tags.some(t => t.includes("investment") || t.includes("financial")), "Financial Services");
    addIf(desc.includes("consumer") || desc.includes("retail") || tags.some(t => t.includes("consumer") || t.includes("retail")), "Consumer & Retail");
    addIf(desc.includes("industrial") || desc.includes("manufacturing") || tags.some(t => t.includes("industrial") || t.includes("manufacturing")), "Industrial & Manufacturing");
    addIf(desc.includes("consulting") || tags.some(t => t.includes("consulting") || t.includes("research")), "Professional Services");
    const out = Array.from(industries);
    return out.length > 0 ? out.slice(0, 5) : ["Technology", "Healthcare", "Financial Services"];
  };

  const handleSort = (column: 'rank' | 'overallScore' | 'avgCostPerCall' | 'status') => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedVendors = () => {
    if (!sortColumn) return vendors;

    return [...vendors].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortColumn) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'overallScore':
          aValue = a.overallScore;
          bValue = b.overallScore;
          break;
        case 'avgCostPerCall':
          // Extract numeric value from cost range (e.g., "$800 - 1500" -> 800)
          aValue = parseInt(a.avgCostPerCall.replace(/[^0-9]/g, ''));
          bValue = parseInt(b.avgCostPerCall.replace(/[^0-9]/g, ''));
          break;
        case 'status':
          aValue = getVendorStatus(a);
          bValue = getVendorStatus(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleCreateCampaign = () => {
    if (!isConfirmButtonEnabled) {
      // Dispatch event to show hints on required fields
      window.dispatchEvent(new CustomEvent('showRequiredFieldHints'));
      return;
    }
    if (onSaveCampaign) {
      onSaveCampaign();
    }
  };

  return (
    <div 
      className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3 relative"
      onClick={onPanelFocus}
      onFocus={onPanelFocus}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Vendor Selection
        </h3>
        {isNewCampaign && onSaveCampaign && (
          <button
            onClick={handleCreateCampaign}
            className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Campaign
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto pr-2">
        {/* Table Header - Sticky */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 p-2 bg-light-background-secondary dark:bg-dark-background-secondary mb-2 text-body-sm font-medium text-light-text dark:text-dark-text">
          <div 
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={() => handleSort('rank')}
          >
            <span>Rank</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-2 flex items-center gap-2">Vendor</div>
          <div 
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={() => handleSort('overallScore')}
          >
            <span>Overall score</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div 
            className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={() => handleSort('avgCostPerCall')}
          >
            <span>Avg Cost per call</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div 
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={() => handleSort('status')}
          >
            <span>Status</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-5 flex items-center gap-2">Description</div>
        </div>

        {/* Vendor Rows */}
        <div className="space-y-1">
          {getSortedVendors().map((vendor) => (
            <div 
              key={vendor.id} 
              onClick={() => handleVendorClick(vendor)}
              className="grid grid-cols-12 gap-4 p-1 rounded-lg border cursor-pointer transition-colors bg-white dark:bg-dark-background-secondary border-light-border dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-800"
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center gap-2">
                <span className="text-body-sm font-medium text-light-text dark:text-dark-text mr-1">
                  {vendor.rank}#
                </span>
                {vendor.rank <= 5 && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-full whitespace-nowrap">
                    Top 5
                  </span>
                )}
              </div>

              {/* Vendor */}
              <div className="col-span-2 flex items-center gap-6 min-w-0">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-body-sm font-medium text-gray-700 dark:text-gray-300">
                    <Image src={vendor.logo} alt={vendor.name} width={40} height={40} className="w-10 h-10 rounded object-cover" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-body-sm font-medium text-light-text dark:text-dark-text truncate">
                    {vendor.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary min-w-0">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{vendor.location}</span>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="col-span-1 flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-500 fill-current" />
                <span className="text-body-sm font-medium text-light-text dark:text-dark-text">
                  {vendor.overallScore}
                </span>
              </div>

              {/* Avg Cost per call */}
              <div className="col-span-2 flex items-center gap-1">
                <span className="text-body-sm text-light-text items-center dark:text-dark-text">
                  {vendor.avgCostPerCall}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center gap-1">
                <span className={`inline-flex items-center justify-center w-28 py-1 text-xs ${getStatusPaddingSize(getVendorStatus(vendor))} font-medium rounded-full whitespace-nowrap ${getStatusPillStyle(getVendorStatus(vendor))}`}>
                  {getVendorStatus(vendor)}
                </span>
              </div>

              {/* Description */}
              <div className="col-span-4 min-w-0">
                <p className="text-body-sm text-light-text dark:text-dark-text mb-2 line-clamp-2 min-w-0">
                  {vendor.description}
                </p>
                <div className="flex gap-1 min-w-0">
                  {vendor.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="inline-block px-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full flex-shrink-0 whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                  {vendor.tags.length > 2 && (
                    <span className="inline-block px-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full flex-shrink-0 whitespace-nowrap">
                      ...
                    </span>
                  )}
                </div>
              </div>

              {/* Enroll Button */}
              <div className="w-[80px] flex items-center justify-center">
                <button
                  onClick={(e) => handleEnrollVendor(e, vendor)}
                  disabled={!isConfirmButtonEnabled || getVendorStatus(vendor) === "Enrolled" || getVendorStatus(vendor) === "Pending"}
                  className={`w-20 px-3 py-2 text-xs rounded-md transition-colors ${
                    !isConfirmButtonEnabled || getVendorStatus(vendor) === "Enrolled" || getVendorStatus(vendor) === "Pending"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-primary-500 hover:bg-primary-600 text-white"
                  }`}
                >
                  {getVendorStatus(vendor) === "Enrolled" ? "Enrolled" : getVendorStatus(vendor) === "Pending" ? "Pending" : "Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Details Modal */}
      {showVendorDetailsModal && selectedVendor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleCloseVendorDetailsModal}
        >
          <div 
            className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col dark:border border-primary-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                Vendor details
              </h2>
              <button
                onClick={handleCloseVendorDetailsModal}
                className="p-1 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Vendor Overview */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image 
                    src={selectedVendor.logo} 
                    alt={selectedVendor.name} 
                    width={64} 
                    height={64} 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">
                    {selectedVendor.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => {
                        const rating = selectedVendor.overallScore;
                        const fullStars = Math.floor(rating);
                        const hasPartialStar = rating % 1 !== 0;
                        const partialStarIndex = fullStars;
                        const partialFillPercentage = Math.round((rating % 1) * 100);
                        
                        if (i < fullStars) {
                          // Full star
                          return (
                            <Star 
                              key={i} 
                              className="w-4 h-4 text-orange-500 fill-orange-500" 
                            />
                          );
                        } else if (i === partialStarIndex && hasPartialStar) {
                          // Partial star
                          return (
                            <div key={i} className="relative w-4 h-4">
                              <Star className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600 absolute" />
                              <div 
                                className="overflow-hidden absolute top-0 left-0 h-full"
                                style={{ width: `${partialFillPercentage}%` }}
                              >
                                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                              </div>
                            </div>
                          );
                        } else {
                          // Empty star
                          return (
                            <Star 
                              key={i} 
                              className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600" 
                            />
                          );
                        }
                      })}
                    </div>
                    <span className="text-body-sm font-medium text-light-text dark:text-dark-text">
                      {selectedVendor.overallScore}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="text-body-sm">Website</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary transition-colors">
                    <Star className="w-4 h-4" />
                    <span className="text-body-sm">Profile</span>
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-6">
                <h4 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">About</h4>
                <p className="text-body-sm text-light-text dark:text-dark-text leading-relaxed">
                  {selectedVendor.description}
                </p>
              </div>

              {/* Pricing & Coverage */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background">
                  <h5 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">Pricing Range</h5>
                  <p className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary">{selectedVendor.avgCostPerCall} per call</p>
                </div>
                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background">
                  <h5 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">Regions Focus</h5>
                  <div className="flex gap-1 overflow-x-auto min-w-0">
                    {getRegionsForVendor(selectedVendor).map((r) => (
                      <span key={r} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full flex-shrink-0 whitespace-nowrap">{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Industries Specialization */}
              <div className="mb-6">
                <h4 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">Industries</h4>
                <div className="flex flex-wrap gap-2 min-w-0">
                  {getIndustriesForVendor(selectedVendor).map((ind) => (
                    <span key={ind} className="px-3 py-1.5 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md text-body-sm text-light-text dark:text-dark-text flex-shrink-0 whitespace-nowrap">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialization Section */}
              <div className="mb-6">
                <h4 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">Specialisation</h4>
                <div className="flex flex-wrap gap-2 min-w-0">
                  {selectedVendor.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md text-body-sm text-light-text dark:text-dark-text flex-shrink-0 whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Account Manager Section */}
              <div className="border-t border-light-border dark:border-dark-border pt-6">
                <h4 className="text-base font-semibold text-light-text dark:text-dark-text mb-4">Account manager</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src="/images/avatar/John Robert.png" 
                        alt="John Doe" 
                        width={48} 
                        height={48} 
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-semibold text-light-text dark:text-dark-text truncate">John Doe</p>
                      <p className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary truncate">Designation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Have questions?</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-windshift-navy dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-body-sm font-medium">Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showEnrollmentModal && vendorToEnroll && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleCancelEnrollment}
        >
          <div 
            className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full dark:border border-primary-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                Confirm Vendor Selection
              </h2>
              <button
                onClick={handleCancelEnrollment}
                className="p-1 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-body text-light-text dark:text-dark-text mb-6">
                You are about to enroll the following vendor for your campaign:
              </p>

              {/* Vendor Information */}
              <div className="bg-light-background dark:bg-dark-background rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <Image 
                    src={vendorToEnroll.logo} 
                    alt={vendorToEnroll.name} 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                      {vendorToEnroll.name}
                    </h3>
                    <div className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Score: {vendorToEnroll.overallScore} | Cost: {vendorToEnroll.avgCostPerCall}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                This vendor will be notified of your campaign and will begin sourcing experts according to your requirements.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelEnrollment}
                  className="px-4 py-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary text-light-text dark:text-dark-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEnrollment}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  Confirm Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
