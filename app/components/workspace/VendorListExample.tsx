"use client";

import React from "react";
import { mockVendorPlatforms, VendorPlatform } from "../../data/mockData";

/**
 * Example component demonstrating how to use shared mockVendorPlatforms data
 * This shows how any component can now access the vendor platform data
 */
export default function VendorListExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Vendor Platforms (from shared mockData)</h2>
      <div className="space-y-2">
        {mockVendorPlatforms.map((vendor: VendorPlatform) => (
          <div key={vendor.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{vendor.name}</h3>
                <p className="text-sm text-gray-600">{vendor.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{vendor.avgCostPerCall}</p>
                <span className={`px-2 py-1 text-xs rounded ${
                  vendor.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  vendor.status === "Enrolled" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {vendor.status}
                </span>
              </div>
            </div>
            <p className="text-sm mt-2">{vendor.description}</p>
            <div className="flex gap-1 overflow-x-auto min-w-0 mt-2">
              {vendor.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex-shrink-0 whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
