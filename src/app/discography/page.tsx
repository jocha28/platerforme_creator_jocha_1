'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import { TabId } from '@/types'
import MaterialIcon from '@/components/ui/MaterialIcon'

const TABS: { id: TabId; label: string }[] = [
  { id: 'latest',   label: 'Tout' },
  { id: 'albums',   label: 'Albums' },
  { id: 'eps',      label: 'EPs' },
  { id: 'mixtapes', label: 'Mixtapes' },
  { id: 'singles',  label: 'Singles' },
]

const TYPE_ACCENT: Record<string, string> = {
  album:   'bg-primary',
  ep:      'bg-secondary',
  mixtape: 'bg-tertiary',
  single:  'bg-error',
}

export default function DiscographyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('latest')
  const [search, setSearch]       = useState('')
  const { play } = usePlayer()

  const filtered = useMemo(() => {
    let list = MOCK_RELEASES
    if (activeTab !== 'latest') {
      const typeMap: Record<string, string> = { albums: 'album', mixtapes: 'mixtape', eps: 'ep', singles: 'single' }
      list = list.filter((r) => r.type === typeMap[activeTab])
    }
    if (search.trim()) {
      list = list.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
    }
    return list
  }, [activeTab, search])

  function onPlay(r: typeof MOCK_RELEASES[0]) {
    const tracks = JOCHA_TRACKS
      .filter((t) => r.type === 'single' ? t.id === r.id : t.albumId === r.id)
      .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <div className="min-h-screen pb-40">

      {/* ── Hero header ── */}
      <div className="relative pt-24 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Fond ambiant : covers en mosaïque floutée */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="flex flex-wrap opacity-10">
            {MOCK_RELEASES.slice(0, 12).map((r) => (
              <div key={r.id} className="relative w-1/4 md:w-1/6 aspect-square shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.coverArt} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <span className="font-label text-[10px] uppercase tracking-[0.35em] text-primary mb-3 block">
            Catalogue complet
          </span>
          <h1 className="font-headline font-black uppercase tracking-tighter leading-none text-on-background mb-4"
            style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>
            Discographie
          </h1>
          <p className="font-body text-on-surface-variant/70 text-base max-w-xl">
            {MOCK_RELEASES.length} sorties · Albums, EPs, Singles
          </p>
        </div>
      </div>

      {/* ── Barre filtres + recherche ── */}
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-lg border-b border-outline-variant/10">
        <div className="px-6 md:px-12 flex items-center gap-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-label text-[11px] uppercase tracking-widest font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-outline-variant/20 shrink-0" />

          {/* Search */}
          <div className="relative flex items-center shrink-0">
            <MaterialIcon name="search" className="absolute left-3 text-sm text-on-surface-variant/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="bg-surface-container rounded-full py-2 pl-9 pr-4 font-label text-xs tracking-widest focus:ring-2 focus:ring-primary/20 placeholder:text-outline/50 outline-none text-on-surface w-44"
            />
          </div>

          <span className="ml-auto font-mono text-[11px] text-on-surface-variant/30 shrink-0">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Grille ── */}
      <div className="px-6 md:px-12 pt-10">
        {filtered.length === 0 ? (
          <div className="text-center py-32 text-on-surface-variant">
            <MaterialIcon name="search_off" size="xl" className="mb-4 opacity-30" />
            <p className="font-label uppercase tracking-widest text-sm">Aucun résultat</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((r) => {
              const accentClass = TYPE_ACCENT[r.type] ?? 'bg-primary'
              return (
                <div key={r.id} className="group flex flex-col">

                  {/* Cover */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-high mb-3">
                    <Image
                      src={r.coverArt}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />

                    {/* Overlay boutons */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end justify-between p-3">
                      <button
                        onClick={() => onPlay(r)}
                        className="w-11 h-11 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shrink-0"
                      >
                        <MaterialIcon name="play_arrow" filled className="text-xl text-on-primary" />
                      </button>
                      <Link
                        href={`/album/${r.slug}`}
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75"
                      >
                        <MaterialIcon name="arrow_forward" className="text-sm text-white" />
                      </Link>
                    </div>

                    {/* Badge type */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-label font-bold uppercase tracking-widest text-white/90 ${accentClass}/80 backdrop-blur-sm`}>
                        {r.type}
                      </span>
                    </div>
                  </div>

                  {/* Infos */}
                  <Link href={`/album/${r.slug}`} className="flex-1">
                    <p className="font-headline font-black text-sm text-on-surface group-hover:text-primary transition-colors leading-tight truncate">
                      {r.title}
                    </p>
                    <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-wider mt-1">
                      {r.year}
                    </p>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
