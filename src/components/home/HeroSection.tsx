'use client'

import Image from 'next/image'
import Link from 'next/link'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { usePlayer } from '@/context/PlayerContext'
import { MOCK_ALBUMS } from '@/data/albums'

const featured = Object.values(MOCK_ALBUMS).find((a) => a.isFeatured) ?? Object.values(MOCK_ALBUMS)[0]

export default function HeroSection() {
  const { play } = usePlayer()

  function handlePlay() {
    if (featured.tracks.length > 0) {
      play(featured.tracks[0], featured.tracks)
    }
  }

  return (
    <section className="relative w-full h-[580px] md:h-[680px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={featured.coverArt}
          alt={featured.title}
          fill
          className="object-cover object-top scale-105"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="relative z-10 p-8 md:p-16 max-w-4xl">
        <p className="font-label text-primary tracking-[0.3em] uppercase text-[10px] font-bold mb-4">
          Latest Release
        </p>
        <h2 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-on-background mb-3 leading-[0.9]">
          {featured.title}
        </h2>
        <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-6">
          {featured.tracks.length} titres • {featured.year} • {featured.genre}
        </p>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <button
            onClick={handlePlay}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 md:px-10 py-4 rounded-full font-bold tracking-tight hover:brightness-110 transition-all flex items-center gap-2 active:scale-95"
          >
            <MaterialIcon name="play_arrow" filled />
            ÉCOUTER
          </button>
          <Link
            href={`/album/${featured.slug}`}
            className="bg-surface-container/40 backdrop-blur-md border border-outline-variant/20 text-on-surface px-8 md:px-10 py-4 rounded-full font-bold tracking-tight hover:bg-surface-container/60 transition-all"
          >
            VOIR L'ALBUM
          </Link>
        </div>
      </div>
    </section>
  )
}
