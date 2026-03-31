'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PanelContextValue {
  panelOpen: boolean
  togglePanel: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const PanelContext = createContext<PanelContextValue>({
  panelOpen: true,
  togglePanel: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
})

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen]             = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const p = localStorage.getItem('nowPlayingPanelOpen')
    if (p !== null) setPanelOpen(p === 'true')
    const s = localStorage.getItem('sidebarCollapsed')
    if (s !== null) setSidebarCollapsed(s === 'true')
  }, [])

  function togglePanel() {
    setPanelOpen((prev) => {
      localStorage.setItem('nowPlayingPanelOpen', String(!prev))
      return !prev
    })
  }

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev))
      return !prev
    })
  }

  return (
    <PanelContext.Provider value={{ panelOpen, togglePanel, sidebarCollapsed, toggleSidebar }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  return useContext(PanelContext)
}