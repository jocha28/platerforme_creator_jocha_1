'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PanelContextValue {
  panelOpen: boolean
  togglePanel: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  fullscreenOpen: boolean
  openFullscreen: () => void
  closeFullscreen: () => void
  sidebarWidth: number
  setSidebarWidth: (w: number) => void
  panelWidth: number
  setPanelWidth: (w: number) => void
}

const PanelContext = createContext<PanelContextValue>({
  panelOpen: true,
  togglePanel: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  fullscreenOpen: false,
  openFullscreen: () => {},
  closeFullscreen: () => {},
  sidebarWidth: 256,
  setSidebarWidth: () => {},
  panelWidth: 288,
  setPanelWidth: () => {},
})

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen]             = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fullscreenOpen, setFullscreenOpen]   = useState(false)
  const [sidebarWidth, setSidebarWidth]       = useState(256)
  const [panelWidth, setPanelWidth]           = useState(288)

  useEffect(() => {
    const p = localStorage.getItem('nowPlayingPanelOpen')
    if (p !== null) setPanelOpen(p === 'true')
    const s = localStorage.getItem('sidebarCollapsed')
    if (s !== null) setSidebarCollapsed(s === 'true')
    const sw = localStorage.getItem('sidebarWidth')
    if (sw !== null) setSidebarWidth(Number(sw))
    const pw = localStorage.getItem('panelWidth')
    if (pw !== null) setPanelWidth(Number(pw))
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

  function handleSetSidebarWidth(w: number) {
    const newWidth = Math.max(160, Math.min(480, w))
    setSidebarWidth(newWidth)
    localStorage.setItem('sidebarWidth', String(newWidth))
  }

  function handleSetPanelWidth(w: number) {
    const newWidth = Math.max(200, Math.min(600, w))
    setPanelWidth(newWidth)
    localStorage.setItem('panelWidth', String(newWidth))
  }

  function openFullscreen() {
    setFullscreenOpen(true)
  }

  function closeFullscreen() {
    setFullscreenOpen(false)
  }

  return (
    <PanelContext.Provider value={{ 
      panelOpen, 
      togglePanel, 
      sidebarCollapsed, 
      toggleSidebar, 
      fullscreenOpen, 
      openFullscreen, 
      closeFullscreen,
      sidebarWidth,
      setSidebarWidth: handleSetSidebarWidth,
      panelWidth,
      setPanelWidth: handleSetPanelWidth
    }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  return useContext(PanelContext)
}