"use client";
import React, { useCallback, useEffect, useState } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";

interface ResizableDividerProps {
  direction: "vertical" | "horizontal";
  onResize: (delta: number) => void;
  className?: string;
}

export default function ResizableDivider({ direction, onResize, className = "" }: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPosition(direction === "vertical" ? e.clientX : e.clientY);
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentPosition = direction === "vertical" ? e.clientX : e.clientY;
    const delta = currentPosition - startPosition;
    
    if (Math.abs(delta) > 5) { // Minimum drag threshold
      onResize(delta);
      setStartPosition(currentPosition);
    }
  }, [isDragging, startPosition, direction, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const IconComponent = direction === "vertical" ? GripVertical : GripHorizontal;

  return (
    <div
      className={`flex items-center justify-center bg-light-border dark:bg-dark-border hover:bg-light-hover dark:hover:bg-dark-hover cursor-${direction === "vertical" ? "col-resize" : "row-resize"} transition-colors ${className}`}
      onMouseDown={handleMouseDown}
    >
      <IconComponent className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
    </div>
  );
}
