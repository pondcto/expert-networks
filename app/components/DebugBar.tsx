"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only toggle for the global `.debug` CSS helpers.
 * - Persists state in localStorage under `debug-ui`.
 * - Applies/removes the `debug` class on the <html> root element.
 * - Is intentionally lightweight and visually unobtrusive.
 */
type DebugBarProps = {
  /** Render style: 'inline' for header/button, 'floating' for fixed bottom-right */
  variant?: "inline" | "floating";
  className?: string;
};

export default function DebugBar({ variant = "floating", className }: DebugBarProps) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (on) root.classList.add("debug");
    else root.classList.remove("debug");
    try {
      localStorage.setItem("debug-ui", on ? "1" : "0");
    } catch {}
  }, [on]);

  useEffect(() => {
    try {
      setOn(localStorage.getItem("debug-ui") === "1");
    } catch {}
  }, []);

  const floatingClasses = "fixed bottom-3 right-3 z-[9999] rounded-xl border px-3 py-1 text-xs bg-white/90 backdrop-blur";
  const inlineClasses = "btn-secondary h-9 px-3 text-xs whitespace-nowrap";
  const classes = `${variant === "inline" ? inlineClasses : floatingClasses}${className ? ` ${className}` : ""}`;

  return (
    <button onClick={() => setOn((v) => !v)} className={classes} title="Toggle layout debug">
      {on ? "Debug ON" : "Debug OFF"}
    </button>
  );
}


