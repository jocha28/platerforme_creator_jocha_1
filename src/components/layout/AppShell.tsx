'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TopAppBar from './TopAppBar'
import BottomNavigation from './BottomNavigation'
import SideNavigation from './SideNavigation'
import DesktopTopBar from './DesktopTopBar'
import MiniPlayer from '@/components/player/MiniPlayer'
import DesktopPlayer from '@/components/player/DesktopPlayer'
import NowPlayingPanel from '@/components/player/NowPlayingPanel'
import SplashScreen from '@/components/layout/SplashScreen'
import { usePlayer } from '@/context/PlayerContext'
import { usePanel } from '@/context/PanelContext'

export default function AppShell({ children }: { children: ReactNode }) {
  const { currentTrack } = usePlayer()
  const { panelOpen, sidebarCollapsed } = usePanel()
  const pathname = usePathname()
  const isNowPlaying = pathname === '/now-playing'
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Marges uniquement sur desktop (sidebar cachée sur mobile)
  const mlStyle = mounted && isDesktop ? (sidebarCollapsed ? 64 : 256) : 0
  const mrStyle = mounted && isDesktop && currentTrack && panelOpen ? 288 : 0

  // Padding bas adapté : mobile (nav 80 + mini-player ~88) / desktop (player 96)
  const pbStyle = mounted
    ? isDesktop
      ? currentTrack ? 104 : 24
      : currentTrack ? 176 : 88
    : 176 // valeur sûre SSR (mobile + player)

  // Now-playing : layout simple
  if (isNowPlaying) {
    return (
      <>
        <SideNavigation />
        {mounted && currentTrack && <DesktopPlayer />}
        <main
          suppressHydrationWarning
          style={{ marginLeft: mlStyle, paddingBottom: pbStyle }}
        >
          {children}
        </main>
      </>
    )
  }

  return (
    <>
      <SplashScreen />

      {/* Mobile */}
      <TopAppBar />
      <BottomNavigation />
      {mounted && currentTrack && <MiniPlayer />}

      {/* Desktop */}
      <SideNavigation />
      <DesktopTopBar />
      {mounted && currentTrack && <DesktopPlayer />}
      {mounted && currentTrack && panelOpen && <NowPlayingPanel />}

      {/* Contenu principal — marges via style inline pour éviter le mismatch SSR/client */}
      <main
        suppressHydrationWarning
        style={{
          marginLeft: mlStyle,
          marginRight: mrStyle,
          paddingBottom: pbStyle,
        }}
      >
        {children}
      </main>
    </>
  )
}