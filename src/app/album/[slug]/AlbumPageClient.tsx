'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Album } from '@/types'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration, formatPlays } from '@/lib/utils'
import TrackRow from '@/components/album/TrackRow'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { JOCHA_TRACKS } from '@/data/tracks'

export default function AlbumPageClient({ album }: { album: Album }) {
  const { play, currentTrack, isPlaying, toggleFavorite, playCounts } = usePlayer()

  // album.tracks est toujours vide (données statiques) — on charge depuis JOCHA_TRACKS
  const tracks =
    album.tracks.length > 0
      ? album.tracks
      : album.type === 'single'
        ? JOCHA_TRACKS.filter((t) => t.id === album.id)
        : JOCHA_TRACKS
            .filter((t) => t.albumId === album.id)
            .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))

  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(tracks.filter((t) => t.isFavorite).map((t) => t.id))
  )

  function handlePlay(startIndex = 0) {
    if (tracks.length > 0) {
      play(tracks[startIndex], tracks)
    }
  }

  function handleShuffle() {
    if (tracks.length > 0) {
      const idx = Math.floor(Math.random() * tracks.length)
      play(tracks[idx], tracks)
    }
  }

  function handleFavorite(trackId: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
    toggleFavorite(trackId)
  }

  const totalPlays = tracks.reduce((sum, t) => sum + (playCounts[t.id] ?? 0), 0)

  return (
    <div className="pt-16 pb-40">
      {/* Hero */}
      <section className="relative w-full px-6 md:px-12 pt-12 pb-16 overflow-hidden">
        {/* Fond cover flou dans le hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.coverArt}
            alt=""
            className="w-full h-full object-cover scale-125 blur-2xl opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end">
          {/* Artwork */}
          <div className="w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-surface-container shadow-2xl relative overflow-hidden group shrink-0 rounded-lg">
            <Image
              src={album.coverArt}
              alt={album.title}
              fill
              className="object-cover object-center transition-all duration-700 group-hover:scale-105"
              unoptimized
              priority
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4 md:space-y-6">
            <div>
              <p className="font-label text-primary uppercase tracking-[0.3em] text-[10px] font-bold">
                {album.type.toUpperCase()} • {album.year}
              </p>
              <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-on-surface mt-2">
                {album.title.toUpperCase()}
              </h2>
              <p className="font-label text-sm text-on-surface-variant mt-3">
                {album.artist}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="font-label text-sm text-on-surface-variant">
                  {tracks.length} TRACKS
                </span>
                <span className="w-1 h-1 bg-outline-variant/40 rounded-full" />
                <span className="font-label text-sm text-on-surface-variant">
                  {formatDuration(album.totalDuration)}
                </span>
                <span className="w-1 h-1 bg-outline-variant/40 rounded-full" />
                <span className="font-label text-sm text-on-surface-variant">
                  {formatPlays(totalPlays)} plays
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
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
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="relative z-10 px-4 md:px-12">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 text-on-surface-variant uppercase tracking-widest text-[10px] font-bold opacity-60">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Titre</div>
            <div className="col-span-2 text-right">Plays</div>
            <div className="col-span-3 text-right">Durée</div>
          </div>

          <div className="space-y-1 md:space-y-2">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                isFavorite={favorites.has(track.id)}
                playCount={playCounts[track.id] ?? 0}
                onPlay={() => handlePlay(idx)}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="relative z-10 mt-12 px-6 md:px-12">
        <Link
          href="/discography"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-xs uppercase tracking-widest"
        >
          <MaterialIcon name="arrow_back" />
          Back to Discography
        </Link>
      </div>
    </div>
  )
}
