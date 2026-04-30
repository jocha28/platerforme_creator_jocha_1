'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import TopAppBar from './TopAppBar'
import BottomNavigation from './BottomNavigation'
import SideNavigation from './SideNavigation'
import DesktopTopBar from './DesktopTopBar'
import MiniPlayer from '@/components/player/MiniPlayer'
import DesktopPlayer from '@/components/player/DesktopPlayer'
import NowPlayingPanel from '@/components/player/NowPlayingPanel'
import FullscreenPlayer from '@/components/player/FullscreenPlayer'
import SplashScreen from '@/components/layout/SplashScreen'
import { usePlayer } from '@/context/PlayerContext'
import { usePanel } from '@/context/PanelContext'

export default function AppShell({ children }: { children: ReactNode }) {
  const { currentTrack } = usePlayer()
  const { 
    panelOpen, 
    sidebarCollapsed, 
    fullscreenOpen, 
    sidebarWidth, 
    setSidebarWidth,
    panelWidth,
    setPanelWidth 
  } = usePanel()
  const pathname = usePathname()
  const isNowPlaying = pathname === '/now-playing'
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Drag states
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isResizingPanel, setIsResizingPanel] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        setSidebarWidth(e.clientX)
      }
      if (isResizingPanel) {
        setPanelWidth(window.innerWidth - e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsResizingSidebar(false)
      setIsResizingPanel(false)
      document.body.style.cursor = 'default'
    }

    if (isResizingSidebar || isResizingPanel) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingSidebar, isResizingPanel, setSidebarWidth, setPanelWidth])

  const pbStyle = mounted
    ? { paddingBottom: isDesktop ? (currentTrack ? 104 : 24) : (currentTrack ? 176 : 88) }
    : { paddingBottom: 176 }

  // Calcul des styles de marges dynamiques
  const mainStyle = mounted && isDesktop ? {
    marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px`,
    marginRight: (currentTrack && panelOpen) ? `${panelWidth}px` : '0px',
  } : {}

  return (
    <>
      <SplashScreen />

      {/* Mobile */}
      <TopAppBar />
      <BottomNavigation />
      {mounted && currentTrack && <MiniPlayer />}

      {/* Desktop */}
      <SideNavigation />
      
      {/* Sidebar Resize Handle */}
      {mounted && isDesktop && !sidebarCollapsed && (
        <div 
          className="fixed top-0 bottom-24 w-1 hover:bg-primary/40 cursor-col-resize z-[60] transition-colors"
          style={{ left: `${sidebarWidth}px` }}
          onMouseDown={() => setIsResizingSidebar(true)}
        />
      )}

      <DesktopTopBar />
      {mounted && currentTrack && <DesktopPlayer />}
      {mounted && currentTrack && panelOpen && <NowPlayingPanel />}
      
      {/* Panel Resize Handle */}
      {mounted && isDesktop && panelOpen && currentTrack && (
        <div 
          className="fixed top-0 bottom-24 w-1 hover:bg-primary/40 cursor-col-resize z-[60] transition-colors"
          style={{ right: `${panelWidth}px` }}
          onMouseDown={() => setIsResizingPanel(true)}
        />
      )}

      {mounted && currentTrack && fullscreenOpen && <FullscreenPlayer />}

      <main
        suppressHydrationWarning
        className="transition-[padding] duration-300 min-h-screen"
        style={{ ...pbStyle, ...mainStyle }}
      >
        {children}
      </main>
    </>
  )
}