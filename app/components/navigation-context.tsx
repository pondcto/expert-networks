"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface NavigationState {
  level1: string
  level2?: string
  level3?: string
}

interface NavigationContextType {
  activeNav: NavigationState
  setActiveNav: (nav: NavigationState) => void
  hoverNav: NavigationState | null
  setHoverNav: (nav: NavigationState | null) => void
  getBreadcrumbs: () => Array<{ title: string; href?: string }>
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavigationState>({
    level1: "WindShift Workspace",
    level2: "Tools",
    level3: "Expert Networks",
  })
  const [hoverNav, setHoverNav] = useState<NavigationState | null>(null)

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ title: activeNav.level1 }]
    if (activeNav.level2) {
      breadcrumbs.push({ title: activeNav.level2 })
    }
    if (activeNav.level3) {
      breadcrumbs.push({ title: activeNav.level3 })
    }
    return breadcrumbs
  }

  return (
    <NavigationContext.Provider value={{ activeNav, setActiveNav, hoverNav, setHoverNav, getBreadcrumbs }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
