'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration, formatPlays } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'

// Top genres extraits des vrais tags des pistes (les 8 plus fréquents)
const TOP_GENRES: string[] = (() => {
  const counts: Record<string, number> = {}
  for (const t of JOCHA_TRACKS) {
    for (const g of (t.genres ?? [])) {
      const key = g.toLowerCase()
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([g]) => g.charAt(0).toUpperCase() + g.slice(1))
})()

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { play, playCounts } = usePlayer()

  // Sorties populaires triées par plays total
  const popularReleases = useMemo(() => {
    return [...MOCK_RELEASES]
      .map((r) => {
        const totalPlays = r.type === 'single'
          ? (playCounts[r.id] ?? 0)
          : JOCHA_TRACKS
              .filter((t) => t.albumId === r.id)
              .reduce((sum, t) => sum + (playCounts[t.id] ?? 0), 0)
        return { ...r, totalPlays }
      })
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 8)
  }, [playCounts])

  const results = useMemo(() => {
    if (!query.trim()) return { releases: [], tracks: [] }
    const q = query.toLowerCase()
    return {
      releases: MOCK_RELEASES.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.genre.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      ),
      tracks: JOCHA_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.albumTitle.toLowerCase().includes(q) ||
          (t.genres ?? []).some((g) => g.toLowerCase().includes(q))
      ),
    }
  }, [query])

  const hasResults = results.releases.length > 0 || results.tracks.length > 0
  const isEmpty = query.trim() !== '' && !hasResults

  return (
    <div className="pt-24 pb-40 px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">
          Recherche
        </span>
        <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-background mb-8">
          SEARCH
        </h2>

        <div className="relative flex items-center group">
          <MaterialIcon
            name="search"
            size="lg"
            className="absolute left-5 text-on-surface-variant group-focus-within:text-primary transition-colors"
          />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ALBUMS, TITRES, GENRES..."
            className="w-full bg-surface-container border border-outline-variant/20 rounded-full py-5 pl-14 pr-6 font-label text-sm tracking-widest uppercase focus:ring-2 focus:ring-primary/30 placeholder:text-outline/50 transition-all outline-none text-on-surface"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <MaterialIcon name="close" />
            </button>
          )}
        </div>
      </div>

      {/* État vide : genres + populaires */}
      {!query && (
        <div>
          {/* Genres extraits des vraies pistes */}
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">
            Parcourir par genre
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOP_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setQuery(genre)}
                className="relative h-20 rounded-2xl overflow-hidden bg-surface-container-high flex items-end p-4 group hover:ring-2 hover:ring-primary/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 opacity-60" />
                <span className="relative font-headline font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                  {genre}
                </span>
              </button>
            ))}
          </div>

          {/* Sorties populaires triées par plays */}
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-10 mb-6">
            Sorties populaires
          </p>
          <div className="space-y-2">
            {popularReleases.map((r) => (
              <Link
                key={r.id}
                href={`/album/${r.slug}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <Image src={r.coverArt} alt={r.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">
                    {r.title}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {r.type} • {r.year}
                  </p>
                </div>
                {r.totalPlays > 0 && (
                  <span className="font-label text-[10px] text-primary font-bold shrink-0">
                    {formatPlays(r.totalPlays)} plays
                  </span>
                )}
                <MaterialIcon name="arrow_forward" className="text-on-surface-variant/40 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {isEmpty && (
        <div className="text-center py-20">
          <MaterialIcon name="search_off" size="xl" className="text-on-surface-variant/30 mb-4" />
          <p className="font-headline text-xl font-bold text-on-surface-variant">Aucun résultat</p>
          <p className="font-label text-sm text-on-surface-variant/60 mt-2">
            Essayez un autre titre ou genre
          </p>
        </div>
      )}

      {/* Résultats releases */}
      {results.releases.length > 0 && (
        <div className="mb-10">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-5">
            Releases ({results.releases.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.releases.map((r) => (
              <Link key={r.id} href={`/album/${r.slug}`} className="group cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden bg-surface-container relative mb-3">
                  <Image src={r.coverArt} alt={r.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                </div>
                <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">
                  {r.title}
                </h4>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {r.type} • {r.year}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Résultats tracks */}
      {results.tracks.length > 0 && (
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-5">
            Titres ({results.tracks.length})
          </p>
          <div className="space-y-2">
            {results.tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => play(track, results.tracks)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors group text-left"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">
                    {track.title}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {track.albumTitle}
                    {(track.genres ?? []).length > 0 && ` • ${track.genres![0]}`}
                    {(playCounts[track.id] ?? 0) > 0 && ` • ${formatPlays(playCounts[track.id])} plays`}
                  </p>
                </div>
                <span className="font-label text-xs text-on-surface-variant shrink-0">
                  {formatDuration(track.duration)}
                </span>
                <MaterialIcon name="play_arrow" className="text-on-surface-variant/0 group-hover:text-primary group-hover:text-on-surface-variant/100 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
