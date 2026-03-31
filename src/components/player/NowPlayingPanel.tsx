'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { useArtist } from '@/context/ArtistContext'
import { usePanel } from '@/context/PanelContext'
import { formatPlays } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { JOCHA_TRACKS } from '@/data/tracks'

export default function NowPlayingPanel() {
  const { currentTrack, queue, play, playCounts } = usePlayer()
  const { profile } = useArtist()
  const { togglePanel } = usePanel()
  const [showArtist, setShowArtist] = useState(false)

  if (!currentTrack) return null

  const currentIdx = queue.findIndex((t) => t.id === currentTrack.id)
  const nextTracks = queue.slice(currentIdx + 1, currentIdx + 4)

  const totalPlays = JOCHA_TRACKS.reduce((sum, t) => sum + (playCounts[t.id] ?? 0), 0)

  return (
    <>
      <aside className="hidden lg:flex fixed right-0 top-0 bottom-24 w-72 flex-col bg-surface-container border-l border-outline-variant/10 z-40 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant/10 shrink-0 flex items-center justify-between">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Lecture en cours</p>
          <button
            onClick={togglePanel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high transition-all"
            title="Fermer"
          >
            <MaterialIcon name="close" className="text-sm" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">

          {/* Cover + info du titre */}
          <div className="p-5">
            <Link href="/now-playing" className="block relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl shadow-black/50 group">
              <Image src={currentTrack.albumArt} alt={currentTrack.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
            </Link>
            <h3 className="font-headline font-black text-lg tracking-tight text-on-background leading-tight">
              {currentTrack.title}
            </h3>
            <p className="font-label text-xs text-primary uppercase tracking-wider mt-1">
              {currentTrack.artist}
            </p>
            <Link
              href={`/album/${currentTrack.albumId}`}
              className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors mt-0.5 block"
            >
              {currentTrack.albumTitle}
            </Link>
          </div>

          {/* Suivant dans la file */}
          {nextTracks.length > 0 && (
            <div className="px-5 pb-5">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Suivant</p>
              <div className="space-y-1">
                {nextTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => play(track, queue)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group text-left"
                  >
                    <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0">
                      <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-xs truncate group-hover:text-primary transition-colors">{track.title}</p>
                      <p className="font-label text-[10px] text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                    <MaterialIcon name="play_arrow" className="text-on-surface-variant opacity-0 group-hover:opacity-100 text-sm transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* À propos de l'artiste */}
          <div className="px-5 pb-6">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">À propos de l&apos;artiste</p>
            <button
              onClick={() => setShowArtist(true)}
              className="w-full block rounded-xl overflow-hidden bg-surface-container-high hover:brightness-110 transition-all text-left"
            >
              {/* Bannière */}
              <div className="relative h-24 w-full">
                {profile.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10" />
                )}
              </div>
              {/* Info */}
              <div className="px-4 pt-2 pb-4 -mt-7 relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-container-high mb-2 shadow-lg bg-surface-container">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MaterialIcon name="person" className="text-on-surface-variant/40 text-2xl" />
                    </div>
                  )}
                </div>
                <p className="font-headline font-black text-sm text-on-background">{profile.name}</p>
                {profile.bio && (
                  <p className="font-label text-[10px] text-on-surface-variant mt-1 leading-relaxed line-clamp-3">
                    {profile.bio}
                  </p>
                )}
              </div>
            </button>
          </div>

        </div>
      </aside>

      {/* Popup artiste */}
      {showArtist && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowArtist(false)} />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md max-h-[85vh] flex flex-col bg-surface-container rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

            {/* Bannière */}
            <div className="relative h-40 shrink-0">
              {profile.coverPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-container to-transparent" />
              <button
                onClick={() => setShowArtist(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-background/80 transition-colors"
              >
                <MaterialIcon name="close" className="text-sm" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 -mt-10 relative">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-container shadow-xl bg-surface-container-high mb-3">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-3xl" />
                  </div>
                )}
              </div>

              {/* Badge + nom */}
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Artiste Vérifié</p>
              <h2 className="font-headline text-3xl font-black tracking-tighter text-on-background uppercase leading-none mb-1">
                {profile.name}
              </h2>
              {profile.location && (
                <p className="flex items-center gap-1.5 font-label text-xs text-on-surface-variant mb-4">
                  <MaterialIcon name="location_on" className="text-sm" />
                  {profile.location}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface-container-high rounded-xl p-4">
                  <p className="font-headline text-2xl font-black tracking-tighter text-on-background">{formatPlays(totalPlays)}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Écoutes</p>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4">
                  <p className="font-headline text-2xl font-black tracking-tighter text-on-background">{JOCHA_TRACKS.length}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Titres</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-5">
                  {profile.bio}
                </p>
              )}

              {/* Genres */}
              {profile.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.genres.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-surface-container rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Lien profil complet */}
              <Link
                href="/profile"
                onClick={() => setShowArtist(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-outline-variant/30 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <MaterialIcon name="person" className="text-sm" />
                Voir le profil complet
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}