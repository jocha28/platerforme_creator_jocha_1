'use client'

import { useState, useRef, useEffect } from 'react'
import { Track } from '@/types'
import { formatDuration, formatPlays, cn, getSingleCertification } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import CertificationDisc from '@/components/ui/CertificationDisc'
import { usePlaylist } from '@/context/PlaylistContext'

interface TrackRowProps {
  track: Track
  index: number
  isCurrent: boolean
  isPlaying: boolean
  isFavorite: boolean
  playCount?: number
  onPlay: (track: Track) => void
  onFavorite: (trackId: string) => void
}

export default function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  isFavorite,
  playCount,
  onPlay,
  onFavorite,
}: TrackRowProps) {
  const { playlists, addToPlaylist, createPlaylist } = usePlaylist()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [newPlaylistMode, setNewPlaylistMode] = useState(false)
  const [newName, setNewName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setNewPlaylistMode(false)
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  function handleAddToPlaylist(playlistId: string) {
    addToPlaylist(playlistId, track.id)
    setDropdownOpen(false)
    setNewPlaylistMode(false)
    setNewName('')
  }

  async function handleCreateAndAdd() {
    const name = newName.trim()
    if (!name) return
    const pl = await createPlaylist(name)
    addToPlaylist(pl.id, track.id)
    setDropdownOpen(false)
    setNewPlaylistMode(false)
    setNewName('')
  }

  return (
    <div
      onClick={() => onPlay(track)}
      className={cn(
        'grid grid-cols-12 items-center px-4 md:px-6 py-4 transition-all group cursor-pointer border-l-2',
        'hover:bg-surface-container-high',
        isCurrent
          ? 'bg-surface-container-high border-primary'
          : 'bg-surface-container-low border-transparent hover:border-primary'
      )}
    >
      {/* Number / EQ */}
      <div className="col-span-1 font-headline text-on-surface-variant group-hover:text-primary transition-colors">
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-0.5 h-5">
            <span className="eq-bar h-full animate-eq-bar-1 text-primary" />
            <span className="eq-bar h-3/4 animate-eq-bar-2 text-primary" />
            <span className="eq-bar h-1/2 animate-eq-bar-3 text-primary" />
          </div>
        ) : (
          <span className={cn(isCurrent ? 'text-primary' : '')}>
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Title + album */}
      <div className="col-span-7 md:col-span-5">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-headline font-bold text-base md:text-lg transition-colors',
              isCurrent ? 'text-primary' : 'group-hover:text-primary'
            )}
          >
            {track.title}
          </h4>
          {isCurrent && isPlaying && (
            <span className="material-symbols-outlined text-primary text-sm animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              graphic_eq
            </span>
          )}
        </div>
        <p className="font-body text-sm text-on-surface-variant">{track.albumTitle}</p>
      </div>

      {/* Plays */}
      <div className="hidden md:block col-span-2 text-right font-label text-xs text-on-surface-variant">
        {formatPlays(playCount ?? track.plays)}
      </div>

      {/* Certification */}
      <div className="hidden md:flex col-span-2 items-center justify-center">
        {(() => {
          const cert = getSingleCertification(playCount ?? track.plays)
          if (!cert) return <span className="font-label text-[9px] text-on-surface-variant/20">—</span>
          return (
            <span title={`Disque de ${cert.label}`} className="flex items-center gap-1.5">
              <CertificationDisc type={cert.disc} size={26} />
              <span className={`font-label text-[9px] uppercase tracking-wider hidden lg:block ${cert.color}`}>
                {cert.label}
              </span>
            </span>
          )
        })()}
      </div>

      {/* Duration + favorite + add to playlist */}
      <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(track.id) }}
          className={cn(
            'transition-colors',
            isFavorite ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          )}
        >
          <MaterialIcon name="favorite" filled={isFavorite} className="text-xl" />
        </button>
        <span className="font-label text-sm text-on-surface-variant hidden md:block">
          {formatDuration(track.duration)}
        </span>

        {/* Add to playlist button + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(prev => !prev)
              setNewPlaylistMode(false)
              setNewName('')
            }}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Ajouter à une playlist"
          >
            <span className="material-symbols-outlined text-xl">add_circle_outline</span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 bottom-full mb-2 w-56 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Ajouter à une playlist
                </p>
              </div>

              {playlists.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  {playlists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl.id)}
                      className="w-full text-left px-4 py-3 font-body text-sm text-on-surface hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">queue_music</span>
                      <span className="truncate">{pl.name}</span>
                      {pl.trackIds.includes(track.id) && (
                        <span className="ml-auto text-primary shrink-0">
                          <span className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-outline-variant/10">
                {newPlaylistMode ? (
                  <div className="p-3 flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Nom…"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateAndAdd()
                        if (e.key === 'Escape') { setNewPlaylistMode(false); setNewName('') }
                      }}
                      className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-body text-xs text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleCreateAndAdd}
                      disabled={!newName.trim()}
                      className="px-3 py-2 bg-primary text-on-primary rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewPlaylistMode(true)}
                    className="w-full text-left px-4 py-3 font-body text-sm text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Nouvelle playlist
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
