'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'

type Release = typeof MOCK_RELEASES[0]

export default function DiscographyBento() {
  const { play } = usePlayer()

  const albums  = MOCK_RELEASES.filter((r) => r.type === 'album')
  const eps     = MOCK_RELEASES.filter((r) => r.type === 'ep')
  const singles = MOCK_RELEASES.filter((r) => r.type === 'single')

  function onPlay(r: Release) {
    const tracks = JOCHA_TRACKS
      .filter((t) => r.type === 'single' ? t.id === r.id : t.albumId === r.id)
      .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  function StaticRow({ label, accent, items }: { label: string; accent: string; items: Release[] }) {
    if (items.length === 0) return null
    return (
      <div>
        <div className="flex items-center gap-2 mb-4 px-6 md:px-12">
          <span className={`w-1 h-4 rounded-full ${accent}`} />
          <p className="font-label text-[11px] uppercase tracking-[0.25em] text-on-surface font-bold">{label}</p>
          <span className="font-mono text-[11px] text-on-surface-variant/40 ml-2">{items.length}</span>
        </div>
        <div className="flex gap-4 px-6 md:px-12 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {items.map((r) => (
            <button
              key={r.id}
              className="group flex items-center gap-4 px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container transition-colors text-left shrink-0"
              style={{ minWidth: '220px' }}
              onClick={() => onPlay(r)}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <Image src={r.coverArt} alt={r.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                  <MaterialIcon name="play_arrow" filled className="text-xl text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-headline font-black text-sm text-on-surface group-hover:text-primary transition-colors truncate leading-tight">
                  {r.title}
                </p>
                <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-wider mt-1">{r.year}</p>
                <Link
                  href={`/album/${r.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-label text-[10px] text-on-surface-variant/30 hover:text-primary transition-colors uppercase tracking-wider"
                >
                  Voir →
                </Link>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const singlesLoop = [...singles, ...singles, ...singles]

  return (
    <section className="mt-20 space-y-8">

      {/* En-tête */}
      <div className="flex justify-between items-baseline px-6 md:px-12">
        <h3 className="font-headline text-2xl font-bold tracking-tight">Discographie</h3>
        <Link
          href="/discography"
          className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
        >
          Tout voir <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>

      {/* Albums — statique */}
      <StaticRow label="Albums" accent="bg-primary" items={albums} />

      {/* EPs — statique */}
      <StaticRow label="EPs" accent="bg-secondary" items={eps} />

      {/* Singles — défilement auto */}
      {singles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 px-6 md:px-12">
            <span className="w-1 h-4 rounded-full bg-error" />
            <p className="font-label text-[11px] uppercase tracking-[0.25em] text-on-surface font-bold">Singles</p>
            <span className="font-mono text-[11px] text-on-surface-variant/40 ml-2">{singles.length}</span>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

            <div
              className="flex gap-3 w-max px-4"
              style={{ animation: `discog-scroll ${singles.length * 4}s linear infinite` }}
            >
              {singlesLoop.map((r, i) => (
                <button
                  key={`${r.id}-${i}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container group transition-colors shrink-0 text-left"
                  onClick={() => onPlay(r)}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                    <Image src={r.coverArt} alt={r.title} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                      <MaterialIcon name="play_arrow" filled className="text-xl text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[140px] leading-tight">
                      {r.title}
                    </p>
                    <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-wider mt-1">
                      {r.year}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes discog-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  )
}
