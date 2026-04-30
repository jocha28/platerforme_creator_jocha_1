'use client'

import Image from 'next/image'
import { useMemo, useState, useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { formatPlays } from '@/lib/utils'

export default function RecommendedSection() {
  const { playCounts, play } = usePlayer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { recommended, hasAnyPlay } = useMemo(() => {
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
    const counts = playCounts || {}
    const entries = Object.entries(counts)
    const anyPlay = entries.some(([, count]) => count > 0)
    
    // If no play counts yet (first load or no data), use some defaults or random
    const tracksToProcess = JOCHA_TRACKS.length > 0 ? JOCHA_TRACKS : []
    if (tracksToProcess.length === 0) return { recommended: [], hasAnyPlay: false }

    // 1. Genre Affinity Scoring
    const genreScores: Record<string, number> = {}
    for (const track of JOCHA_TRACKS) {
      const count = counts[track.id] ?? 0
      if (count > 0 && track.genres) {
        for (const genre of track.genres) {
          genreScores[genre] = (genreScores[genre] ?? 0) + count
        }
      }
    }

    // 2. Advanced Scoring & Selection
    const scored = JOCHA_TRACKS.map(track => {
      const commonGenres = (track.genres ?? []).filter(g => genreScores[g] > 0)
      const genreMatch = commonGenres.reduce((sum, g) => sum + (genreScores[g] || 0), 0)
      const playCount = counts[track.id] ?? 0
      
      const trackSeed = track.id.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
      const dailyRandom = ((trackSeed * (daySeed + 123)) % 1000) / 1000

      // Score Affinity (Genre match)
      const affinityScore = Math.log1p(genreMatch) * (0.8 + dailyRandom * 0.4)
      
      // Score Discovery (Random + Not played much)
      const discoveryScore = (1 / (1 + playCount)) * (0.5 + dailyRandom * 2.0)
      
      return { track, affinityScore, discoveryScore }
    })

    // Pick 4 from high affinity and 4 from high discovery
    const favorites = [...scored]
      .sort((a, b) => b.affinityScore - a.affinityScore)
      .slice(0, 15) // Top 15 favoris
    
    const discoveries = [...scored]
      .sort((a, b) => b.discoveryScore - a.discoveryScore)
      .slice(0, 15) // Top 15 découvertes

    // Mélanger et prendre 8 au total de façon aléatoire basée sur le jour
    const combined = [...favorites, ...discoveries]
    const unique = Array.from(new Set(combined.map(s => s.track.id)))
      .map(id => combined.find(s => s.track.id === id)!)
      .sort((a, b) => {
        const seedA = a.track.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        const seedB = b.track.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        return ((seedA * daySeed) % 100) - ((seedB * daySeed) % 100)
      })
      .slice(0, 8)
      .map(s => s.track)

    return { recommended: unique, hasAnyPlay: anyPlay }
  }, [playCounts, mounted])

  if (!mounted) return (
    <section className="mt-16 px-6 md:px-12 animate-pulse">
      <div className="h-8 w-48 bg-surface-container rounded-lg mb-8" />
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-none w-64 aspect-[4/5] bg-surface-container rounded-3xl" />
        ))}
      </div>
    </section>
  )

  return (
    <section className="mt-20 px-6 md:px-12 relative overflow-hidden py-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline text-3xl font-bold tracking-tighter text-on-surface">
            {hasAnyPlay ? 'Recommandé pour toi' : 'Découvertes du jour'}
          </h3>
          <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-[0.2em]">
            Sélectionné avec soin par l'algorithme Jocha
          </p>
        </div>
        
        <button 
          onClick={() => recommended.length > 0 && play(recommended[0], recommended)}
          className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary rounded-full transition-all duration-300 group shadow-sm border border-outline-variant/20"
        >
          <span className="font-label text-xs font-bold uppercase tracking-widest">Tout lire</span>
          <MaterialIcon name="play_arrow" filled className="text-lg group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 relative z-10">
        {recommended.map((track) => (
          <div
            key={track.id}
            className="flex-none w-56 md:w-64 group cursor-pointer"
            onClick={() => play(track, recommended)}
          >
            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-surface-container shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-primary/20">
              <Image
                src={track.albumArt}
                alt={track.title}
                fill
                className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              
              {/* Glass Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center text-on-primary shadow-2xl border border-white/20">
                  <MaterialIcon name="play_arrow" filled className="text-3xl" />
                </div>
              </div>

              {/* Stats Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                {(playCounts[track.id] ?? 0) > 0 && (
                  <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 font-label text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    {formatPlays(playCounts[track.id])}
                  </div>
                )}
                <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 font-label text-[10px] font-bold text-white uppercase tracking-wider">
                  {(track.genres ?? [])[0] || 'Rap'}
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="font-headline font-black text-xl text-white leading-tight mb-1 drop-shadow-lg">
                  {track.title}
                </h4>
                <p className="font-label text-[10px] text-white/60 uppercase tracking-widest truncate">
                  {track.albumTitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
