'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { formatPlays } from '@/lib/utils'
import { useMemo } from 'react'

export default function TrendingCarousel() {
  const { playCounts, play } = usePlayer()

  const trending = useMemo(() => {
    return [...JOCHA_TRACKS]
      .sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0))
      .slice(0, 10)
  }, [playCounts])

  return (
    <section className="mt-12 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-8">
        <h3 className="font-headline text-2xl font-bold tracking-tight">Trending Now</h3>
        <Link
          href="/discography"
          className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
        >
          See All
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {trending.map((track) => (
          <div
            key={track.id}
            className="flex-none w-56 md:w-64 group cursor-pointer"
            onClick={() => play(track, trending)}
          >
            <div className="aspect-square relative rounded-xl overflow-hidden bg-surface-container mb-4">
              <Image
                src={track.albumArt}
                alt={track.title}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xl">
                  <MaterialIcon name="play_arrow" filled />
                </div>
              </div>
              {(playCounts[track.id] ?? 0) > 0 && (
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/70 backdrop-blur-sm rounded-full font-label text-[10px] font-bold text-primary uppercase tracking-wider">
                  {formatPlays(playCounts[track.id])} plays
                </div>
              )}
            </div>
            <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              {track.title}
            </h4>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
              {track.albumTitle} • {(playCounts[track.id] ?? 0) === 0 ? '—' : formatPlays(playCounts[track.id])}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
