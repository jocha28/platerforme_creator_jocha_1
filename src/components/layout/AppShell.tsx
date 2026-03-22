'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import TopAppBar from './TopAppBar'
import BottomNavigation from './BottomNavigation'
import SideNavigation from './SideNavigation'
import DesktopTopBar from './DesktopTopBar'
import MiniPlayer from '@/components/player/MiniPlayer'
import DesktopPlayer from '@/components/player/DesktopPlayer'
import SplashScreen from '@/components/layout/SplashScreen'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/lib/utils'

export default function AppShell({ children }: { children: ReactNode }) {
  const { currentTrack } = usePlayer()
  const pathname = usePathname()
  const isNowPlaying = pathname === '/now-playing'

  // Now-playing: sidebar + desktop player visible on lg, nothing on mobile
  if (isNowPlaying) {
    return (
      <>
        <SideNavigation />
        {currentTrack && <DesktopPlayer />}
        <main className={cn('lg:ml-64', currentTrack ? 'lg:pb-24' : '')}>
          {children}
        </main>
      </>
    )
  }

  return (
    <>
      <SplashScreen />

      {/* ── Mobile ── */}
      <TopAppBar />
      <BottomNavigation />
      {currentTrack && <MiniPlayer />}

      {/* ── Desktop ── */}
      <SideNavigation />
      <DesktopTopBar />
      {currentTrack && <DesktopPlayer />}

      {/* ── Content ── */}
      <main
        className={cn(
          'lg:ml-64',
          currentTrack ? 'lg:pb-28' : 'lg:pb-6',
          currentTrack ? 'pb-40 md:pb-28' : 'pb-20 md:pb-4',
        )}
      >
        {children}
      </main>
    </>
  )
}
