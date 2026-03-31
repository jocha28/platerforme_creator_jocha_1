'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { formatPlays, formatDuration } from '@/lib/utils'
import { useMemo } from 'react'

export default function TrendingCarousel() {
  const { playCounts, play, currentTrack, isPlaying } = usePlayer()

  const trending = useMemo(() => {
    return [...JOCHA_TRACKS]
      .sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0))
      .slice(0, 8)
  }, [playCounts])

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-2xl font-bold tracking-tight">En ce moment</h3>
          <span className="px-2 py-0.5 bg-primary/10 rounded-full font-label text-[10px] text-primary uppercase tracking-widest">Top {trending.length}</span>
        </div>
        <Link
          href="/discography"
          className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
        >
          Tout voir <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>

      {/* Liste numérotée — desktop */}
      <div className="hidden md:grid grid-cols-2 gap-x-8 gap-y-1">
        {trending.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id
          const plays = playCounts[track.id] ?? 0
          return (
            <button
              key={track.id}
              onClick={() => play(track, trending)}
              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors group text-left"
            >
              {/* Numéro */}
              <span className={`font-headline font-black text-xl w-6 shrink-0 text-right leading-none tabular-nums ${isCurrent ? 'text-primary' : 'text-on-surface-variant/20'}`}>
                {isCurrent && isPlaying
                  ? <MaterialIcon name="graphic_eq" className="text-primary text-base" filled />
                  : i + 1}
              </span>

              {/* Cover */}
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                {isCurrent && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-headline font-bold text-sm truncate transition-colors ${isCurrent ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                  {track.title}
                </p>
                <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-wider truncate mt-0.5">
                  {track.albumTitle}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                {plays > 0 ? (
                  <p className="font-label text-xs text-primary font-bold">{formatPlays(plays)}</p>
                ) : (
                  <p className="font-label text-xs text-on-surface-variant/30">—</p>
                )}
                <p className="font-label text-[10px] text-on-surface-variant/40 mt-0.5">{formatDuration(track.duration)}</p>
              </div>

              {/* Play icon */}
              <MaterialIcon
                name="play_circle"
                className="text-primary text-xl opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                filled
              />
            </button>
          )
        })}
      </div>

      {/* Carousel cartes — mobile */}
      <div className="md:hidden flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {trending.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id
          return (
            <button
              key={track.id}
              onClick={() => play(track, trending)}
              className="flex-none w-36 group text-left"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container mb-3">
                <Image src={track.albumArt} alt={track.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-2 left-2 font-headline font-black text-2xl text-white/20 leading-none">{i + 1}</span>
                {isCurrent && isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MaterialIcon name="graphic_eq" className="text-primary text-3xl" filled />
                  </div>
                )}
              </div>
              <p className={`font-headline font-bold text-xs truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{track.title}</p>
              <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider truncate">{track.albumTitle}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}