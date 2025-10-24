"use client";
import React from "react";

interface ToggleSwitchProps {
  isActive: boolean;
  onChange: (isActive: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ isActive, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <div 
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
        isActive ? 'bg-primary-500' : 'bg-primary-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onChange(!isActive)}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
        isActive ? 'translate-x-6' : 'translate-x-0.5'
      }`}></div>
    </div>
  );
}
