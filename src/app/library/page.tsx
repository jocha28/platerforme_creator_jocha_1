'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePlaylist } from '@/context/PlaylistContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'

export default function LibraryPage() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylist()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const pl = await createPlaylist(name)
    setNewName('')
    setShowModal(false)
    router.push(`/playlist/${pl.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') { setShowModal(false); setNewName('') }
  }

  return (
    <div className="pt-16 pb-40 px-6 md:px-12">
      {/* Header */}
      <div className="mt-10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">
              Bibliothèque
            </h1>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-[0.2em] mt-1">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm rounded-full hover:brightness-110 transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouvelle Playlist
          </button>
        </div>
      </div>

      {/* Grid */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl opacity-30">queue_music</span>
          <p className="font-headline text-lg font-bold uppercase tracking-wider opacity-50">
            Aucune playlist
          </p>
          <p className="font-body text-sm opacity-40">
            Crée ta première playlist pour organiser tes sons
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {playlists.map((pl) => {
            const firstTrack = pl.trackIds.length > 0
              ? JOCHA_TRACKS.find(t => t.id === pl.trackIds[0])
              : null
            const displayCover = pl.cover ?? firstTrack?.albumArt ?? null

            return (
              <div key={pl.id} className="group relative">
                <button
                  onClick={() => router.push(`/playlist/${pl.id}`)}
                  className="w-full text-left"
                >
                  {/* Cover */}
                  <div className="aspect-square relative rounded-xl overflow-hidden bg-surface-container mb-3 shadow-lg">
                    {displayCover ? (
                      <Image
                        src={displayCover}
                        alt={pl.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
                          queue_music
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xl">
                        <span className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                    {pl.name}
                  </h3>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    {pl.trackIds.length} titre{pl.trackIds.length !== 1 ? 's' : ''}
                  </p>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id) }}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer la playlist"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => { setShowModal(false); setNewName('') }}
        >
          <div
            className="bg-surface-container-high rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-outline-variant/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-headline text-xl font-black uppercase tracking-tighter mb-6">
              Nouvelle Playlist
            </h2>
            <input
              autoFocus
              type="text"
              placeholder="Nom de la playlist…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setNewName('') }}
                className="flex-1 py-3 rounded-full border border-outline-variant/20 font-headline font-bold uppercase tracking-widest text-sm text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-full bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
