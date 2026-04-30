'use client'

import Image from 'next/image'
import Link from 'next/link'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { usePlayer } from '@/context/PlayerContext'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'

const featured = MOCK_RELEASES[0]

export default function HeroSection() {
  const { play } = usePlayer()

  const tracks = JOCHA_TRACKS
    .filter((t) => featured.type === 'single' ? t.id === featured.id : t.albumId === featured.id)
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))

  function handlePlay() {
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <section className="overflow-hidden">

      {/* ════════════════════════════════
          MOBILE  (< lg)
      ════════════════════════════════ */}
      <div className="lg:hidden flex flex-col">

        {/* Cover grande — haut */}
        <div className="relative w-full aspect-square">
          <Image
            src={featured.coverArt}
            alt={featured.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
          {/* Dégradé bas pour fondre avec le contenu */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

          {/* Badge flottant en haut à gauche */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md border border-primary/40 rounded-full font-label text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Nouvelle Sortie
            </span>
          </div>

          {/* Type + année flottant en haut à droite */}
          <div className="absolute top-4 right-4">
            <span className="font-label text-[10px] text-white/60 uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full">
              {featured.type.toUpperCase()} · {featured.year}
            </span>
          </div>
        </div>

        {/* Contenu texte */}
        <div className="px-6 pt-4 pb-8 -mt-8 relative z-10">
          <h1 className="font-headline font-black uppercase tracking-tighter text-on-background leading-[0.85] mb-3"
            style={{ fontSize: 'clamp(2.8rem, 14vw, 4rem)' }}>
            {featured.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-6 text-on-surface-variant/60">
            <span className="font-label text-xs uppercase tracking-widest">{tracks.length} titres</span>
            <span className="text-outline-variant">·</span>
            <span className="font-label text-xs uppercase tracking-widest">{featured.genre}</span>
            <span className="text-outline-variant">·</span>
            <span className="font-label text-xs text-primary uppercase tracking-widest font-bold">Jocha</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold uppercase tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-primary/30"
            >
              <MaterialIcon name="play_arrow" filled size="lg" />
              Écouter
            </button>
            <Link
              href={`/album/${featured.slug}`}
              className="flex items-center justify-center gap-2 px-5 py-4 border border-outline-variant/30 text-on-surface rounded-2xl font-headline font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-all"
            >
              <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          DESKTOP  (≥ lg)
      ════════════════════════════════ */}
      <div className="hidden lg:flex flex-row min-h-[calc(100vh-4rem)]">

        {/* Panneau gauche : texte */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-14 xl:px-20">

          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-full font-label text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Nouvelle Sortie
            </span>
            <span className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
              {featured.type.toUpperCase()} · {featured.year}
            </span>
          </div>

          <h1
            className="font-headline font-black uppercase tracking-tighter text-on-background leading-[0.85] mb-6"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}
          >
            {featured.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-8 text-on-surface-variant/70">
            <span className="font-label text-xs uppercase tracking-widest">{tracks.length} titres</span>
            <span className="text-outline-variant">·</span>
            <span className="font-label text-xs uppercase tracking-widest">{featured.genre}</span>
            <span className="text-outline-variant">·</span>
            <span className="font-label text-xs text-primary uppercase tracking-widest font-bold">Jocha</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/25"
            >
              <MaterialIcon name="play_arrow" filled size="lg" />
              Écouter
            </button>
            <Link
              href={`/album/${featured.slug}`}
              className="flex items-center gap-2 px-8 py-4 border border-outline-variant/25 text-on-surface rounded-full font-headline font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-all"
            >
              Explorer
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>

          {tracks.length > 0 && (
            <div className="border-t border-outline-variant/10 pt-6 space-y-1 max-w-sm">
              <p className="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/40 mb-3 px-3">
                Sur cet {featured.type === 'album' ? 'Album' : 'EP'}
              </p>
              {tracks.slice(0, 3).map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => play(t, tracks)}
                  className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors group text-left"
                >
                  <span className="font-label text-[10px] text-on-surface-variant/30 w-4 shrink-0 text-right">{i + 1}</span>
                  <span className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors flex-1 truncate">
                    {t.title}
                  </span>
                  <MaterialIcon name="play_arrow" className="text-on-surface-variant text-sm opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panneau droit : cover */}
        <div className="w-[42%] xl:w-[45%] shrink-0 relative">
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          <Image
            src={featured.coverArt}
            alt={featured.title}
            fill
            className="object-cover object-center"
            unoptimized
            priority
          />
        </div>
      </div>
    </section>
  )
}