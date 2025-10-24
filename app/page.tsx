"use client";

import { Suspense } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset } from "./components/ui/sidebar";
import Logo from "./components/Logo";
import { useTheme } from "./providers/theme-provider";
import UserMenu from "./components/UserMenu";
import { Sun, Moon } from "lucide-react";


function HomeContent() {
  const { theme, toggleTheme } = useTheme();
  

  return (
    <main className="h-screen flex flex-col bg-light-background dark:bg-dark-background">
      {/* Windshift Ribbon */}
      <header className="w-[100vw] sticky top-0 z-50 shrink-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <UserMenu />
          </div>
        </div>
      </header>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
          <div className="text-body text-light-text-secondary dark:text-dark-text-secondary">
            Loading...
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="h-full">
            <HomeContent />
          </div>
        </SidebarInset>
      </div>
    </Suspense>
  );
}
