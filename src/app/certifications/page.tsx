'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import { MOCK_RELEASES } from '@/data/releases'
import { getSingleCertification, formatPlays, formatDuration } from '@/lib/utils'
import CertificationDisc from '@/components/ui/CertificationDisc'
import MaterialIcon from '@/components/ui/MaterialIcon'

type Filter = 'all' | 'diamant' | 'platine' | 'or'

const FILTER_LABELS: Record<Filter, string> = {
  all:     'Tout',
  diamant: 'Diamant',
  platine: 'Platine',
  or:      'Or',
}

const CERT_ORDER: Record<string, number> = { diamant: 0, platine: 1, or: 2 }

export default function CertificationsPage() {
  const { playCounts, play, currentTrack, isPlaying } = usePlayer()
  const [filter, setFilter] = useState<Filter>('all')

  // Tous les sons certifiés, triés par écoutes desc
  const certified = useMemo(() => {
    return JOCHA_TRACKS
      .map((track) => {
        const plays = playCounts[track.id] ?? track.plays ?? 0
        const cert  = getSingleCertification(plays)
        return cert ? { track, plays, cert } : null
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aOrder = CERT_ORDER[a!.cert.disc]
        const bOrder = CERT_ORDER[b!.cert.disc]
        if (aOrder !== bOrder) return aOrder - bOrder
        return b!.plays - a!.plays
      }) as { track: typeof JOCHA_TRACKS[0]; plays: number; cert: NonNullable<ReturnType<typeof getSingleCertification>> }[]
  }, [playCounts])

  const filtered = useMemo(() => {
    if (filter === 'all') return certified
    return certified.filter((c) => c.cert.disc === filter)
  }, [certified, filter])

  // Compteurs par type
  const counts = useMemo(() => ({
    diamant: certified.filter((c) => c.cert.disc === 'diamant').length,
    platine: certified.filter((c) => c.cert.disc === 'platine').length,
    or:      certified.filter((c) => c.cert.disc === 'or').length,
  }), [certified])

  function handlePlay(idx: number) {
    const tracks = filtered.map((c) => c.track)
    play(filtered[idx].track, tracks)
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-16">
        {/* Fond : covers floutées */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="flex flex-wrap opacity-[0.07]">
            {certified.slice(0, 18).map(({ track }) => (
              <div key={track.id} className="relative w-1/6 aspect-square shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 px-6 md:px-12 pt-10 pb-14">
          <h1
            className="font-headline font-black uppercase tracking-tighter leading-none text-on-background mb-3"
            style={{ fontSize: 'clamp(2.8rem, 9vw, 6rem)' }}
          >
            Certifications
          </h1>
          <p className="font-body text-on-surface-variant/70 text-sm mb-10 max-w-md">
            {certified.length} titre{certified.length > 1 ? 's' : ''} certifié{certified.length > 1 ? 's' : ''} sur {JOCHA_TRACKS.length} au catalogue
          </p>

          {/* Compteurs par niveau */}
          <div className="flex flex-wrap gap-4">
            {/* Diamant */}
            <button
              onClick={() => setFilter(filter === 'diamant' ? 'all' : 'diamant')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all group ${
                filter === 'diamant'
                  ? 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_24px_rgba(0,200,255,0.15)]'
                  : 'bg-surface-container border-outline-variant/10 hover:border-cyan-400/30 hover:bg-cyan-500/5'
              }`}
            >
              <CertificationDisc type="diamant" size={52} />
              <div className="text-left">
                <p className="font-headline font-black text-3xl text-cyan-300 leading-none">{counts.diamant}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Diamant</p>
              </div>
            </button>

            {/* Platine */}
            <button
              onClick={() => setFilter(filter === 'platine' ? 'all' : 'platine')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all group ${
                filter === 'platine'
                  ? 'bg-slate-400/10 border-slate-400/40 shadow-[0_0_24px_rgba(160,160,200,0.15)]'
                  : 'bg-surface-container border-outline-variant/10 hover:border-slate-400/30 hover:bg-slate-400/5'
              }`}
            >
              <CertificationDisc type="platine" size={52} />
              <div className="text-left">
                <p className="font-headline font-black text-3xl text-slate-300 leading-none">{counts.platine}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Platine</p>
              </div>
            </button>

            {/* Or */}
            <button
              onClick={() => setFilter(filter === 'or' ? 'all' : 'or')}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all group ${
                filter === 'or'
                  ? 'bg-yellow-500/10 border-yellow-400/40 shadow-[0_0_24px_rgba(255,200,0,0.15)]'
                  : 'bg-surface-container border-outline-variant/10 hover:border-yellow-400/30 hover:bg-yellow-500/5'
              }`}
            >
              <CertificationDisc type="or" size={52} />
              <div className="text-left">
                <p className="font-headline font-black text-3xl text-yellow-400 leading-none">{counts.or}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Or</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Barre filtres sticky ── */}
      <div className="sticky top-16 z-20 bg-background/85 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="px-6 md:px-12 flex items-center gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider font-bold transition-all shrink-0 ${
                filter === f
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {f !== 'all' && <CertificationDisc type={f} size={16} />}
              {FILTER_LABELS[f]}
              <span className={`text-[10px] font-normal ${filter === f ? 'opacity-70' : 'opacity-50'}`}>
                {f === 'all' ? certified.length : counts[f as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste ── */}
      <div className="px-4 md:px-8 py-6 max-w-5xl">

        {filtered.length === 0 && (
          <div className="py-24 flex flex-col items-center gap-4 text-on-surface-variant">
            <CertificationDisc type="or" size={64} />
            <p className="font-label text-sm uppercase tracking-wider">Aucun titre dans cette catégorie</p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(({ track, plays, cert }, idx) => {
            const isCurrent = currentTrack?.id === track.id
            const discGlow = cert.disc === 'diamant'
              ? 'shadow-[0_0_20px_rgba(0,200,255,0.2)]'
              : cert.disc === 'platine'
              ? 'shadow-[0_0_20px_rgba(160,160,200,0.15)]'
              : 'shadow-[0_0_20px_rgba(255,200,0,0.15)]'

            return (
              <div
                key={track.id}
                onClick={() => handlePlay(idx)}
                className={`group flex items-center gap-4 md:gap-6 px-4 md:px-5 py-4 rounded-2xl cursor-pointer transition-all border ${
                  isCurrent
                    ? 'bg-primary/8 border-primary/30'
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container hover:border-outline-variant/20'
                }`}
              >
                {/* Rank */}
                <span className="font-headline font-black text-2xl md:text-3xl text-on-surface-variant/20 w-8 text-right shrink-0 leading-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Grand disque de certification */}
                <div className={`shrink-0 rounded-full ${discGlow} transition-all group-hover:scale-110`}>
                  <CertificationDisc type={cert.disc} size={56} />
                </div>

                {/* Cover album */}
                <Link
                  href={`/album/${MOCK_RELEASES.find(r => track.albumId === 'singles' ? r.id === track.id : r.id === track.albumId)?.slug || (track.albumId === 'singles' ? '' : track.albumId)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="relative h-12 w-12 md:h-14 md:w-14 rounded-lg overflow-hidden shrink-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={track.albumArt}
                    alt={track.albumTitle}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </Link>

                {/* Infos titre */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-headline font-bold text-base md:text-lg leading-tight truncate transition-colors ${
                      isCurrent ? 'text-primary' : 'text-on-background group-hover:text-primary'
                    }`}>
                      {track.title}
                    </h3>
                    {isCurrent && isPlaying && (
                      <span
                        className="material-symbols-outlined text-primary text-sm animate-pulse shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        graphic_eq
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="font-body text-sm text-on-surface-variant">{track.albumTitle}</p>
                    {track.genres && track.genres[0] && (
                      <>
                        <span className="text-on-surface-variant/30 text-xs">·</span>
                        <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/50">
                          {track.genres[0]}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badge certification + plays (desktop) */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className={`font-label text-xs uppercase tracking-wider font-bold ${cert.color}`}>
                    Disque de {cert.label}
                  </span>
                  <span className="font-label text-[10px] text-on-surface-variant">
                    {formatPlays(plays)} écoutes
                  </span>
                </div>

                {/* Durée + play button */}
                <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                  <span className="hidden md:block font-label text-xs text-on-surface-variant/50">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-primary text-on-primary shadow-lg'
                        : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handlePlay(idx) }}
                  >
                    <MaterialIcon
                      name={isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                      filled
                      className="text-lg"
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}