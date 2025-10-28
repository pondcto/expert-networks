"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: { projectName: string; projectCode: string }) => void;
}

export default function NewProjectModal({ isOpen, onClose, onSave }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [errors, setErrors] = useState<{ projectName?: string; projectCode?: string }>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setProjectName("");
    setProjectCode("");
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { projectName?: string; projectCode?: string } = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!projectCode.trim()) {
      newErrors.projectCode = "Project code is required";
    } else if (!/^[A-Z0-9-]+$/.test(projectCode)) {
      newErrors.projectCode = "Project code must contain only uppercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ projectName, projectCode });
      handleClose();
    }
  };

  const handleProjectCodeChange = (value: string) => {
    // Auto-convert to uppercase and replace spaces with hyphens
    const formatted = value.toUpperCase().replace(/\s+/g, '-');
    setProjectCode(formatted);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div 
        className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded transition-colors"
          >
            <X className="w-5 h-5 text-light-text dark:text-dark-text" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Project Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Market Research Initiative"
              className={`w-full px-3 py-2 bg-light-background dark:bg-dark-background border ${
                errors.projectName ? 'border-red-500' : 'border-light-border dark:border-dark-border'
              } rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
            {errors.projectName && (
              <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>
            )}
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Project Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectCode}
              onChange={(e) => handleProjectCodeChange(e.target.value)}
              placeholder="e.g., MRI-2024"
              className={`w-full px-3 py-2 bg-light-background dark:bg-dark-background border ${
                errors.projectCode ? 'border-red-500' : 'border-light-border dark:border-dark-border'
              } rounded text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase`}
            />
            {errors.projectCode && (
              <p className="text-xs text-red-500 mt-1">{errors.projectCode}</p>
            )}
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              Use uppercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="bg-light-background dark:bg-dark-background p-4 rounded-lg">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <strong>Note:</strong> After creating a project, you can create campaigns and assign them to this project using the project code.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

