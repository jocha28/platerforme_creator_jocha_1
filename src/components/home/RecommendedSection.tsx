'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { formatPlays } from '@/lib/utils'

export default function RecommendedSection() {
  const { playCounts, play } = usePlayer()

  const { recommended, hasAnyPlay } = useMemo(() => {
    const entries = Object.entries(playCounts)
    const anyPlay = entries.some(([, count]) => count > 0)

    if (!anyPlay) {
      return { recommended: [], hasAnyPlay: false }
    }

    // 1. Calculer les scores de genre pondérés par playCount
    const genreScores: Record<string, number> = {}
    for (const track of JOCHA_TRACKS) {
      const count = playCounts[track.id] ?? 0
      if (count > 0 && track.genres) {
        for (const genre of track.genres) {
          genreScores[genre] = (genreScores[genre] ?? 0) + count
        }
      }
    }

    // 2. Calculer un score pour chaque piste
    const scored = JOCHA_TRACKS.map(track => {
      const commonGenres = (track.genres ?? []).filter(g => genreScores[g] > 0)
      const genreMatch = commonGenres.reduce((sum, g) => sum + genreScores[g], 0)
      const score = genreMatch / (1 + (playCounts[track.id] ?? 0))
      return { track, score }
    })

    // 3. Top 8 avec score > 0, sinon 8 premières non jouées
    const withScore = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.track)

    const result = withScore.length > 0
      ? withScore
      : JOCHA_TRACKS.filter(t => (playCounts[t.id] ?? 0) === 0).slice(0, 8)

    return { recommended: result, hasAnyPlay: true }
  }, [playCounts])

  if (!hasAnyPlay) {
    return (
      <section className="mt-12 px-6 md:px-12">
        <div className="flex justify-between items-baseline mb-8">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Recommandé pour toi</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant bg-surface-container-low rounded-2xl">
          <span className="material-symbols-outlined text-5xl opacity-30"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <p className="font-body text-sm opacity-50 text-center max-w-xs">
            Écoute des sons pour obtenir des recommandations
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-12 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-8">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Recommandé pour toi</h3>
          <span className="material-symbols-outlined text-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {recommended.map((track) => (
          <div
            key={track.id}
            className="flex-none w-56 md:w-64 group cursor-pointer"
            onClick={() => play(track, recommended)}
          >
            <div className="aspect-square relative rounded-xl overflow-hidden bg-surface-container mb-4">
              <Image
                src={track.albumArt}
                alt={track.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
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
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1 truncate">
              {(track.genres ?? []).slice(0, 2).join(' • ') || track.albumTitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
