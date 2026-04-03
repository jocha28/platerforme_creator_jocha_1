'use client'

import { use, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePlaylist } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAdmin } from '@/context/AdminContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import { formatDuration, getSingleCertification } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import CertificationDisc from '@/components/ui/CertificationDisc'
import SystemPlaylistCover from '@/components/ui/SystemPlaylistCover'
import { cn } from '@/lib/utils'

const SYSTEM_IDS = new Set([
  'pl-singles-jocha', 'pl-albums-jocha', 'pl-eps-jocha', 'pl-catalogue-jocha',
  'pl-daily-drill', 'pl-daily-trap', 'pl-daily-conscious', 'pl-daily-french', 'pl-daily-cloud',
])

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PlaylistDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { playlists, removeFromPlaylist, updatePlaylist } = usePlaylist()
  const { play, currentTrack, isPlaying, toggleFavorite, playCounts } = usePlayer()
  const { isAdmin } = useAdmin()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [editOpen, setEditOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  function openEdit() {
    if (isAdmin) setEditOpen(true)
    else setLoginOpen(true)
  }

  const playlist = playlists.find(p => p.id === id)

  if (!playlist) {
    return (
      <div className="pt-16 pb-40 flex flex-col items-center justify-center min-h-screen gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl opacity-30">queue_music</span>
        <p className="font-headline text-xl font-black uppercase tracking-tighter opacity-50">
          Playlist introuvable
        </p>
        <Link
          href="/library"
          className="font-label text-xs uppercase tracking-widest text-primary hover:underline mt-2"
        >
          ← Retour à la bibliothèque
        </Link>
      </div>
    )
  }

  const tracks = playlist.trackIds
    .map(tid => JOCHA_TRACKS.find(t => t.id === tid))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  const firstTrack = tracks[0] ?? null
  const totalDuration = tracks.reduce((s, t) => s + t.duration, 0)

  // Cover à afficher : custom > premier titre > null
  const displayCover = playlist.cover ?? firstTrack?.albumArt ?? null

  function handlePlay(startIndex = 0) {
    if (tracks.length > 0) play(tracks[startIndex], tracks)
  }

  function handleShuffle() {
    if (tracks.length > 0) {
      const idx = Math.floor(Math.random() * tracks.length)
      play(tracks[idx], tracks)
    }
  }

  function handleFavorite(trackId: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
    toggleFavorite(trackId)
  }

  return (
    <div className="pt-16 pb-40">
      {/* Modals */}
      {editOpen && (
        <EditPlaylistModal
          playlist={playlist}
          onSave={(patch) => { updatePlaylist(playlist.id, patch); setEditOpen(false) }}
          onClose={() => setEditOpen(false)}
        />
      )}
      {loginOpen && (
        <AdminLoginModalInline onClose={() => setLoginOpen(false)} />
      )}

      {/* Hero */}
      <section className="relative w-full px-6 md:px-12 pt-12 pb-16 overflow-hidden">
        {/* Blurred background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {displayCover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayCover}
              alt=""
              className="w-full h-full object-cover scale-125 blur-2xl opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end">
          {/* Cover */}
          {SYSTEM_IDS.has(playlist.id) ? (
            <div className="w-48 md:w-80 lg:w-96 shrink-0 shadow-2xl rounded-lg overflow-hidden">
              <SystemPlaylistCover playlist={playlist} />
            </div>
          ) : (
            <button
              onClick={openEdit}
              className="group w-48 md:w-80 lg:w-96 aspect-square bg-surface-container shadow-2xl relative overflow-hidden shrink-0 rounded-lg flex items-center justify-center"
            >
              {displayCover ? (
                <Image
                  src={displayCover}
                  alt={playlist.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                  priority
                />
              ) : (
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/20">
                  queue_music
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <MaterialIcon name="edit" className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          )}

          {/* Metadata */}
          <div className="flex-1 space-y-4 md:space-y-6">
            <div>
              <p className="font-label text-primary uppercase tracking-[0.3em] text-[10px] font-bold">
                PLAYLIST
              </p>
              <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-on-surface mt-2">
                {playlist.name.toUpperCase()}
              </h2>
              {playlist.description && (
                <p className="font-body text-sm text-on-surface-variant mt-3 max-w-xl leading-relaxed">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="font-label text-sm text-on-surface-variant">
                  {tracks.length} TITRE{tracks.length !== 1 ? 'S' : ''}
                </span>
                {tracks.length > 0 && (
                  <>
                    <span className="w-1 h-1 bg-outline-variant/40 rounded-full" />
                    <span className="font-label text-sm text-on-surface-variant">
                      {formatDuration(totalDuration)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {tracks.length > 0 && (
                <>
                  <button
                    onClick={() => handlePlay(0)}
                    className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold uppercase tracking-widest text-sm rounded-full flex items-center gap-2 hover:brightness-110 transition-all active:scale-95"
                  >
                    <MaterialIcon name="play_arrow" filled />
                    PLAY ALL
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="px-8 md:px-10 py-3 md:py-4 border border-outline-variant/20 text-on-surface font-headline font-bold uppercase tracking-widest text-sm rounded-full flex items-center gap-2 hover:bg-surface-container-high transition-all active:scale-95"
                  >
                    <MaterialIcon name="shuffle" />
                    SHUFFLE
                  </button>
                </>
              )}
              <button
                onClick={openEdit}
                className="px-8 md:px-10 py-3 md:py-4 border border-primary/30 text-primary font-headline font-bold uppercase tracking-widest text-sm rounded-full flex items-center gap-2 hover:bg-primary/10 transition-all active:scale-95"
              >
                <MaterialIcon name="edit" />
                ÉDITER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="relative z-10 px-4 md:px-12">
        <div className="max-w-6xl">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-30">music_off</span>
              <p className="font-headline text-lg font-bold uppercase tracking-wider opacity-50">
                Aucun titre
              </p>
              <p className="font-body text-sm opacity-40 text-center max-w-xs">
                Ajoute des sons depuis n&apos;importe quelle page en cliquant sur le bouton +
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 px-6 py-4 text-on-surface-variant uppercase tracking-widest text-[10px] font-bold opacity-60">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Titre</div>
                <div className="col-span-2 text-center">Certification</div>
                <div className="col-span-3 text-right">Durée</div>
                <div className="col-span-1 text-right">Retirer</div>
              </div>

              <div className="space-y-1 md:space-y-2">
                {tracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id
                  const isTrackPlaying = isCurrent && isPlaying
                  const isFav = favorites.has(track.id)

                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlay(idx)}
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
                        {isTrackPlaying ? (
                          <div className="flex items-end gap-0.5 h-5">
                            <span className="eq-bar h-full animate-eq-bar-1 text-primary" />
                            <span className="eq-bar h-3/4 animate-eq-bar-2 text-primary" />
                            <span className="eq-bar h-1/2 animate-eq-bar-3 text-primary" />
                          </div>
                        ) : (
                          <span className={cn(isCurrent ? 'text-primary' : '')}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Cover + Title */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 relative">
                          <Image
                            src={track.albumArt}
                            alt={track.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className={cn(
                            'font-headline font-bold text-sm md:text-base transition-colors truncate',
                            isCurrent ? 'text-primary' : 'group-hover:text-primary'
                          )}>
                            {track.title}
                          </h4>
                          <p className="font-body text-xs text-on-surface-variant truncate">{track.albumTitle}</p>
                        </div>
                      </div>

                      {/* Certification */}
                      <div className="hidden md:flex col-span-2 items-center justify-center">
                        {(() => {
                          const cert = getSingleCertification(playCounts[track.id] ?? 0)
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

                      {/* Duration + favorite */}
                      <div className="col-span-3 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFavorite(track.id) }}
                          className={cn(
                            'transition-colors',
                            isFav ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                          )}
                        >
                          <MaterialIcon name="favorite" filled={isFav} className="text-xl" />
                        </button>
                        <span className="font-label text-sm text-on-surface-variant hidden md:block">
                          {formatDuration(track.duration)}
                        </span>
                      </div>

                      {/* Remove from playlist */}
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, track.id) }}
                          className="text-on-surface-variant hover:text-error transition-colors"
                          title="Retirer de la playlist"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Back link */}
      <div className="relative z-10 mt-12 px-6 md:px-12">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-xs uppercase tracking-widest"
        >
          <MaterialIcon name="arrow_back" />
          Retour à la bibliothèque
        </Link>
      </div>
    </div>
  )
}

/* ── Mini modal login admin ── */
function AdminLoginModalInline({ onClose }: { onClose: () => void }) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await login(password)
    setLoading(false)
    if (ok) { setPassword(''); onClose() }
    else setError('Mot de passe incorrect')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-high rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-outline-variant/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <MaterialIcon name="lock" className="text-primary text-2xl" />
          <h2 className="font-headline text-xl font-black uppercase tracking-tighter">Accès Admin</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input autoFocus type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
          />
          {error && <p className="font-label text-xs text-error">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-outline-variant/20 font-headline font-bold uppercase tracking-widest text-sm text-on-surface-variant hover:bg-surface-container transition-all">Annuler</button>
            <button type="submit" disabled={!password || loading} className="flex-1 py-3 rounded-full bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
              {loading ? '...' : 'Entrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal d'édition de playlist ── */
interface EditPlaylistModalProps {
  playlist: { name: string; cover?: string; description?: string }
  onSave: (patch: { name?: string; cover?: string; description?: string }) => void
  onClose: () => void
}

function EditPlaylistModal({ playlist, onSave, onClose }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name)
  const [description, setDescription] = useState(playlist.description ?? '')
  const [cover, setCover] = useState(playlist.cover ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCover(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: name.trim() || playlist.name,
      cover: cover || undefined,
      description: description.trim() || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high rounded-2xl p-8 w-full max-w-md shadow-2xl border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <MaterialIcon name="edit" className="text-primary text-2xl" />
          <h2 className="font-headline text-xl font-black uppercase tracking-tighter">
            Modifier la playlist
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Cover */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative w-40 h-40 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center shrink-0"
            >
              {cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
                  image
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <MaterialIcon name="upload" className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
              Clique pour changer la cover
            </p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {cover && (
              <button
                type="button"
                onClick={() => setCover('')}
                className="font-label text-[10px] text-error hover:underline uppercase tracking-widest"
              >
                Supprimer la cover
              </button>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ajoute une description…"
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-outline-variant/20 font-headline font-bold uppercase tracking-widest text-sm text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
