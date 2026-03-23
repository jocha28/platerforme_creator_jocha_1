'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { JOCHA_TRACKS } from '@/data/tracks'

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  cover?: string
  description?: string
}

interface PlaylistContextValue {
  playlists: Playlist[]
  createPlaylist: (name: string) => Playlist
  deletePlaylist: (id: string) => void
  addToPlaylist: (playlistId: string, trackId: string) => void
  bulkAddToPlaylist: (playlistId: string, trackIds: string[]) => void
  removeFromPlaylist: (playlistId: string, trackId: string) => void
  renamePlaylist: (id: string, name: string) => void
  updatePlaylist: (id: string, patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description'>>) => void
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null)
const KEY = 'jocha_playlists'

// IDs de tous les singles
const SINGLE_IDS = JOCHA_TRACKS.filter((t) => t.albumId === 'singles').map((t) => t.id)

const DEFAULT_SINGLES_PLAYLIST: Playlist = {
  id: 'pl-singles-jocha',
  name: 'Singles de Jocha',
  description: `${SINGLE_IDS.length} singles officiels`,
  cover: JOCHA_TRACKS.find((t) => t.albumId === 'singles')?.albumArt,
  trackIds: SINGLE_IDS,
  createdAt: 0,
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY)
      const loaded: Playlist[] = s ? JSON.parse(s) : []

      // S'assurer que la playlist "Singles de Jocha" existe et est à jour
      const hasSingles = loaded.some((p) => p.id === DEFAULT_SINGLES_PLAYLIST.id)
      const base = hasSingles
        ? loaded.map((p) =>
            p.id === DEFAULT_SINGLES_PLAYLIST.id
              ? { ...p, trackIds: SINGLE_IDS, description: DEFAULT_SINGLES_PLAYLIST.description }
              : p
          )
        : [DEFAULT_SINGLES_PLAYLIST, ...loaded]

      setPlaylists(base)
      try { localStorage.setItem(KEY, JSON.stringify(base)) } catch {}
    } catch {}
  }, [])

  function save(next: Playlist[]) {
    setPlaylists(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }

  function createPlaylist(name: string): Playlist {
    const p: Playlist = { id: `pl-${Date.now()}`, name, trackIds: [], createdAt: Date.now() }
    save([...playlists, p])
    return p
  }

  function deletePlaylist(id: string) { save(playlists.filter(p => p.id !== id)) }

  function addToPlaylist(playlistId: string, trackId: string) {
    save(playlists.map(p => p.id === playlistId && !p.trackIds.includes(trackId)
      ? { ...p, trackIds: [...p.trackIds, trackId] } : p))
  }

  function bulkAddToPlaylist(playlistId: string, trackIds: string[]) {
    save(playlists.map(p => {
      if (p.id !== playlistId) return p
      const existing = new Set(p.trackIds)
      const merged = [...p.trackIds, ...trackIds.filter(id => !existing.has(id))]
      return { ...p, trackIds: merged }
    }))
  }

  function removeFromPlaylist(playlistId: string, trackId: string) {
    save(playlists.map(p => p.id === playlistId
      ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) } : p))
  }

  function renamePlaylist(id: string, name: string) {
    save(playlists.map(p => p.id === id ? { ...p, name } : p))
  }

  function updatePlaylist(id: string, patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description'>>) {
    save(playlists.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, deletePlaylist, addToPlaylist, bulkAddToPlaylist, removeFromPlaylist, renamePlaylist, updatePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const ctx = useContext(PlaylistContext)
  if (!ctx) throw new Error('usePlaylist must be inside PlaylistProvider')
  return ctx
}
