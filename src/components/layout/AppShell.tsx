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
  const { panelOpen, sidebarCollapsed, fullscreenOpen } = usePanel()
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

  // Padding bas adapté : mobile (nav 80 + mini-player ~88) / desktop (player 96)
  const pbStyle = mounted
    ? { paddingBottom: isDesktop ? (currentTrack ? 104 : 24) : (currentTrack ? 176 : 88) }
    : { paddingBottom: 176 } // valeur sûre SSR

  // Classes Tailwind pour les marges — appliquées immédiatement via CSS
  // sans attendre le JS, évite le chevauchement avec la sidebar
  const mainClass = cn(
    'transition-[margin] duration-300',
    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
    currentTrack && panelOpen ? 'lg:mr-72' : 'lg:mr-0',
  )

  if (isNowPlaying) {
    return (
      <>
        <SideNavigation />
        {mounted && currentTrack && <DesktopPlayer />}
        {mounted && currentTrack && fullscreenOpen && <FullscreenPlayer />}
        <main
          suppressHydrationWarning
          className={cn(sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64', 'transition-[margin] duration-300')}
          style={pbStyle}
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
      {mounted && currentTrack && fullscreenOpen && <FullscreenPlayer />}

      {/* Contenu principal — marges via classes CSS, pas de délai JS */}
      <main
        suppressHydrationWarning
        className={mainClass}
        style={pbStyle}
      >
        {children}
      </main>
    </>
  )
}