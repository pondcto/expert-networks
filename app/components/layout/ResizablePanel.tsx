"use client";
import React from "react";

interface ResizablePanelProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

export default function ResizablePanel({ 
  children, 
  width, 
  height, 
  minWidth = 200, 
  maxWidth = 800,
  minHeight = 200,
  maxHeight = 600,
  className = ""
}: ResizablePanelProps) {
  const style = {
    ...(width && { width: `${width}%` }),
    ...(height && { height: `${height}%` }),
    minWidth: `${minWidth}px`,
    maxWidth: `${maxWidth}px`,
    minHeight: `${minHeight}px`,
    maxHeight: `${maxHeight}px`
  };

  return (
    <div 
      className={`flex flex-col overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
