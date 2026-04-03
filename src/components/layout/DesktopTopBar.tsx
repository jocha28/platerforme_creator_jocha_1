'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useArtist } from '@/context/ArtistContext'
import { usePlayer } from '@/context/PlayerContext'
import { usePanel } from '@/context/PanelContext'

export default function DesktopTopBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { profile } = useArtist()
  const { currentTrack } = usePlayer()
  const { panelOpen, togglePanel, sidebarCollapsed } = usePanel()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className={`hidden lg:flex fixed top-0 right-0 h-16 z-40 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 items-center justify-between px-8 transition-all duration-300 ${sidebarCollapsed ? 'left-16' : 'left-64'}`}>
      {/* Boutons navigation historique */}
      <div className="flex items-center gap-1 mr-4 shrink-0">
        <button
          onClick={() => router.back()}
          title="Page précédente"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <MaterialIcon name="arrow_back" className="text-lg" />
        </button>
        <button
          onClick={() => window.history.forward()}
          title="Page suivante"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <MaterialIcon name="arrow_forward" className="text-lg" />
        </button>
      </div>

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
        {currentTrack && !panelOpen && (
          <button
            onClick={togglePanel}
            title="Ouvrir le panneau"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
          >
            <MaterialIcon name="right_panel_open" className="text-lg" />
          </button>
        )}
        <Avatar src={profile.avatar} alt={profile.name} size="sm" />
      </div>
    </header>
  )
}
