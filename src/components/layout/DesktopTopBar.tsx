'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useArtist } from '@/context/ArtistContext'

export default function DesktopTopBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { profile } = useArtist()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="hidden lg:flex fixed top-0 left-64 right-0 h-16 z-40 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 items-center justify-between px-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <MaterialIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-surface-container rounded-full pl-10 pr-4 py-2 text-sm font-label text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/20 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-6">
        <Avatar src={profile.avatar} alt={profile.name} size="sm" />
      </div>
    </header>
  )
}
