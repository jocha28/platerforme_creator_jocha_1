'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Playlist } from '@/types'

export type { Playlist }

interface PlaylistContextValue {
  playlists: Playlist[]
  createPlaylist: (name: string) => Promise<Playlist>
  deletePlaylist: (id: string) => void
  addToPlaylist: (playlistId: string, trackId: string) => void
  bulkAddToPlaylist: (playlistId: string, trackIds: string[]) => void
  removeFromPlaylist: (playlistId: string, trackId: string) => void
  renamePlaylist: (id: string, name: string) => void
  updatePlaylist: (id: string, patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description'>>) => void
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  // Charger les playlists depuis le serveur au montage
  useEffect(() => {
    fetch('/api/playlists')
      .then((r) => r.ok ? r.json() : [])
      .then((data: Playlist[]) => setPlaylists(data))
      .catch(() => {})
  }, [])

  async function createPlaylist(name: string): Promise<Playlist> {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const created: Playlist = await res.json()
    setPlaylists((prev) => [...prev, created])
    return created
  }

  function deletePlaylist(id: string) {
    setPlaylists((prev) => prev.filter((p) => p.id !== id))
    fetch(`/api/playlists/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  function patchPlaylist(id: string, patch: Partial<Playlist>) {
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    fetch(`/api/playlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  function addToPlaylist(playlistId: string, trackId: string) {
    const pl = playlists.find((p) => p.id === playlistId)
    if (!pl || pl.trackIds.includes(trackId)) return
    patchPlaylist(playlistId, { trackIds: [...pl.trackIds, trackId] })
  }

  function bulkAddToPlaylist(playlistId: string, trackIds: string[]) {
    const pl = playlists.find((p) => p.id === playlistId)
    if (!pl) return
    const existing = new Set(pl.trackIds)
    const merged = [...pl.trackIds, ...trackIds.filter((id) => !existing.has(id))]
    patchPlaylist(playlistId, { trackIds: merged })
  }

  function removeFromPlaylist(playlistId: string, trackId: string) {
    const pl = playlists.find((p) => p.id === playlistId)
    if (!pl) return
    patchPlaylist(playlistId, { trackIds: pl.trackIds.filter((id) => id !== trackId) })
  }

  function renamePlaylist(id: string, name: string) {
    patchPlaylist(id, { name })
  }

  function updatePlaylist(id: string, patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description'>>) {
    patchPlaylist(id, patch)
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
