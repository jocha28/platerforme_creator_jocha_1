'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import { useArtist } from '@/context/ArtistContext'
import LogoOwl from '@/components/ui/LogoOwl'

export default function TopAppBar() {
  const pathname = usePathname()
  const { profile } = useArtist()
  if (pathname === '/now-playing') return null

  return (
    <header className="lg:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoOwl size={34} className="text-primary" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/search" className="hidden md:block text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </Link>
        <Avatar
          src={profile.avatar}
          alt="Artist"
          size="sm"
        />
      </div>
    </header>
  )
}
