'use client'

import { usePlayer } from '@/context/PlayerContext'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'
import Image from 'next/image'
import Link from 'next/link'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useState, useEffect, useMemo } from 'react'

export default function WeeklyTopReleasesSection() {
  const { weeklyTopReleaseIds, play } = usePlayer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const topReleases = useMemo(() => {
    if (!mounted) return []
    return weeklyTopReleaseIds
      .map(id => MOCK_RELEASES.find(r => r.id === id))
      .filter(Boolean) as typeof MOCK_RELEASES
  }, [weeklyTopReleaseIds])

  if (topReleases.length === 0) return null

  function onPlayRelease(release: typeof MOCK_RELEASES[0]) {
    const tracks = JOCHA_TRACKS
      .filter((t) => release.type === 'single' ? t.id === release.id : t.albumId === release.id)
      .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Projets les plus écoutés</h3>
          <span className="px-2 py-0.5 bg-primary/10 rounded-full font-label text-[10px] text-primary uppercase tracking-widest">Cette semaine</span>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {topReleases.map((release, i) => (
          <div key={release.id} className="flex-none w-48 md:w-56 group">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container mb-4 shadow-xl">
              <Image 
                src={release.coverArt} 
                alt={release.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                unoptimized 
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => onPlayRelease(release)}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                >
                  <MaterialIcon name="play_arrow" filled className="text-2xl" />
                </button>
                <Link 
                  href={`/album/${release.slug}`}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75"
                >
                  <MaterialIcon name="arrow_forward" className="text-xl" />
                </Link>
              </div>

              {/* Badge type */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full font-label text-[9px] text-white/90 uppercase tracking-widest font-bold">
                  {release.type}
                </span>
              </div>

              {/* Ranking number */}
              <div className="absolute -bottom-2 -left-2 font-headline font-black text-6xl text-white/10 italic pointer-events-none">
                {i + 1}
              </div>
            </div>

            <Link href={`/album/${release.slug}`} className="block">
              <h4 className="font-headline font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                {release.title}
              </h4>
              <p className="font-label text-[11px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
                {release.year} • {release.genre}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
