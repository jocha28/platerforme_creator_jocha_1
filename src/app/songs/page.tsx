'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { JOCHA_TRACKS } from '@/data/tracks'
import { MOCK_RELEASES } from '@/data/releases'
import { usePlayer } from '@/context/PlayerContext'
import { formatPlays, formatDuration, getSingleCertification } from '@/lib/utils'
import CertificationDisc from '@/components/ui/CertificationDisc'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

const PROJECTS = MOCK_RELEASES.filter((r) => r.type !== 'single')
const SINGLES  = JOCHA_TRACKS.filter((t) => t.albumId === 'singles')

export default function SongsPage() {
  const { play, currentTrack, isPlaying, playCounts } = usePlayer()
  const [search, setSearch] = useState('')
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set(PROJECTS.map((p) => p.id)))

  function toggleProject(id: string) {
    setOpenProjects((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredSingles = useMemo(() => {
    if (!search.trim()) return SINGLES
    return SINGLES.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return PROJECTS
    return PROJECTS.map((p) => ({
      ...p,
      tracks: JOCHA_TRACKS.filter(
        (t) => t.albumId === p.id && t.title.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((p) => p.tracks.length > 0)
  }, [search])

  function playTrack(track: typeof JOCHA_TRACKS[0]) {
    play(track, JOCHA_TRACKS)
  }

  const totalTracks = JOCHA_TRACKS.length

  return (
    <div className="min-h-screen pt-16 pb-32">

      {/* ── Hero ── */}
      <div className="px-6 md:px-12 pt-8 pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.35em] text-primary mb-2">Catalogue complet</p>
        <h1 className="font-headline font-black uppercase tracking-tighter text-on-background leading-none mb-1"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
          Tous les sons
        </h1>
        <p className="font-body text-on-surface-variant/60 text-sm mb-6">
          {totalTracks} titres · {PROJECTS.length} projets · {SINGLES.length} singles
        </p>

        {/* Recherche */}
        <div className="relative max-w-md">
          <MaterialIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-lg pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un titre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-on-surface placeholder:text-on-surface-variant/35 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors">
              <MaterialIcon name="close" className="text-sm" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 space-y-8 max-w-5xl">

        {/* ─────────────────────────
            ALBUMS & EPs
        ───────────────────────── */}
        {filteredProjects.map((project) => {
          const projectTracks = search.trim()
            ? project.tracks
            : JOCHA_TRACKS.filter((t) => t.albumId === project.id).sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
          const isOpen = openProjects.has(project.id)

          return (
            <div key={project.id} className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">

              {/* Header projet */}
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-surface-container transition-colors text-left"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg">
                  <Image src={project.coverArt} alt={project.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'font-label text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                      project.type === 'album' ? 'bg-primary/15 text-primary' :
                      project.type === 'ep'    ? 'bg-secondary/15 text-secondary' :
                                                 'bg-tertiary/15 text-tertiary'
                    )}>
                      {project.type}
                    </span>
                    <span className="font-label text-[10px] text-on-surface-variant/40">{project.year}</span>
                  </div>
                  <h3 className="font-headline font-black text-base text-on-background leading-tight mt-0.5 truncate">
                    {project.title}
                  </h3>
                  <p className="font-label text-[10px] text-on-surface-variant/50 mt-0.5">
                    {projectTracks.length} titre{projectTracks.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/album/${project.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-on-surface-variant/40 hover:text-primary transition-colors"
                    title="Voir l'album"
                  >
                    <MaterialIcon name="arrow_outward" className="text-base" />
                  </Link>
                  <MaterialIcon
                    name={isOpen ? 'expand_less' : 'expand_more'}
                    className="text-on-surface-variant/40 text-xl"
                  />
                </div>
              </button>

              {/* Liste des pistes */}
              {isOpen && (
                <div className="border-t border-outline-variant/10 divide-y divide-outline-variant/8">
                  {projectTracks.map((track, idx) => {
                    const plays   = playCounts[track.id] ?? 0
                    const cert    = getSingleCertification(plays)
                    const current = currentTrack?.id === track.id

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all group',
                          current ? 'bg-primary/8' : 'hover:bg-surface-container'
                        )}
                      >
                        {/* Numéro / play */}
                        <span className="font-mono text-xs text-on-surface-variant/25 w-5 text-right shrink-0 group-hover:hidden">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <MaterialIcon
                          name={current && isPlaying ? 'pause' : 'play_arrow'}
                          filled
                          className="hidden group-hover:block text-primary shrink-0 w-5 text-base"
                        />

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-headline font-bold text-sm leading-tight truncate',
                            current ? 'text-primary' : 'text-on-background group-hover:text-primary transition-colors'
                          )}>
                            {track.title}
                            {current && isPlaying && (
                              <span className="material-symbols-outlined text-primary text-xs ml-1.5 animate-pulse align-middle"
                                style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                            )}
                          </p>
                          {plays > 0 && (
                            <p className="font-label text-[9px] text-on-surface-variant/40 mt-0.5">
                              {formatPlays(plays)} écoutes
                            </p>
                          )}
                        </div>

                        {/* Cert */}
                        {cert && (
                          <div className="shrink-0 hidden sm:flex items-center gap-1.5">
                            <CertificationDisc type={cert.disc} size={18} />
                            <span className={`font-label text-[9px] uppercase tracking-wider hidden md:block ${cert.color}`}>
                              {cert.label}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            href={`/lyrics/${track.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-on-surface-variant/30 hover:text-primary transition-colors"
                            title="Paroles"
                          >
                            <MaterialIcon name="lyrics" className="text-base" />
                          </Link>
                          <span className="font-label text-xs text-on-surface-variant/30">
                            {formatDuration(track.duration)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* ─────────────────────────
            SINGLES
        ───────────────────────── */}
        <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">
          <div className="flex items-center justify-between px-4 py-4 border-b border-outline-variant/10">
            <div>
              <span className="font-label text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-error/15 text-error">
                Singles
              </span>
              <p className="font-label text-[10px] text-on-surface-variant/40 mt-1">
                {filteredSingles.length} titre{filteredSingles.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/discography?tab=singles"
              className="text-on-surface-variant/40 hover:text-primary transition-colors"
              title="Voir tous les singles"
            >
              <MaterialIcon name="arrow_outward" className="text-base" />
            </Link>
          </div>

          <div className="divide-y divide-outline-variant/8">
            {filteredSingles.map((track) => {
              const plays   = playCounts[track.id] ?? 0
              const cert    = getSingleCertification(plays)
              const current = currentTrack?.id === track.id

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all group',
                    current ? 'bg-primary/8' : 'hover:bg-surface-container'
                  )}
                >
                  {/* Cover */}
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                    <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-headline font-bold text-sm leading-tight truncate',
                      current ? 'text-primary' : 'text-on-background group-hover:text-primary transition-colors'
                    )}>
                      {track.title}
                      {current && isPlaying && (
                        <span className="material-symbols-outlined text-primary text-xs ml-1.5 animate-pulse align-middle"
                          style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                      )}
                    </p>
                    {plays > 0 && (
                      <p className="font-label text-[9px] text-on-surface-variant/40 mt-0.5">
                        {formatPlays(plays)} écoutes
                      </p>
                    )}
                  </div>

                  {/* Cert */}
                  {cert && (
                    <div className="shrink-0 hidden sm:flex items-center gap-1.5">
                      <CertificationDisc type={cert.disc} size={18} />
                      <span className={`font-label text-[9px] uppercase tracking-wider hidden md:block ${cert.color}`}>
                        {cert.label}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/lyrics/${track.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-on-surface-variant/30 hover:text-primary transition-colors"
                      title="Paroles"
                    >
                      <MaterialIcon name="lyrics" className="text-base" />
                    </Link>
                    <span className="font-label text-xs text-on-surface-variant/30">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Message si aucun résultat */}
        {search.trim() && filteredProjects.length === 0 && filteredSingles.length === 0 && (
          <div className="py-16 text-center text-on-surface-variant">
            <MaterialIcon name="search_off" className="text-4xl opacity-30 mb-3" />
            <p className="font-label text-sm uppercase tracking-wider opacity-50">Aucun titre trouvé</p>
          </div>
        )}

      </div>
    </div>
  )
}