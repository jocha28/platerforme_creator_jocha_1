'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export default function QueuePage() {
  const router = useRouter()
  const { queue, currentTrack, isPlaying, play } = usePlayer()

  const currentIdx = queue.findIndex(t => t.id === currentTrack?.id)
  const upcoming = currentIdx >= 0 ? queue.slice(currentIdx + 1) : queue
  const played = currentIdx > 0 ? queue.slice(0, currentIdx) : []

  if (!currentTrack) {
    return (
      <div className="pt-24 pb-40 min-h-screen flex flex-col items-center justify-center gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-7xl opacity-20">queue_music</span>
        <p className="font-headline text-xl font-black uppercase tracking-tighter opacity-40">File vide</p>
        <p className="font-label text-sm opacity-50">Lance un son pour voir la file d'attente</p>
        <button
          onClick={() => router.back()}
          className="mt-4 font-label text-xs uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
        >
          <MaterialIcon name="arrow_back" className="text-sm" /> Retour
        </button>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-40 px-4 md:px-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all shrink-0"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <div>
          <h1 className="font-headline font-black text-2xl tracking-tight">File d'attente</h1>
          <p className="font-label text-xs text-on-surface-variant mt-0.5">
            {upcoming.length} titre{upcoming.length !== 1 ? 's' : ''} à venir
          </p>
        </div>
      </div>

      {/* En cours */}
      <section className="mb-8">
        <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-3">
          En cours
        </p>
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/8 border border-primary/15">
          <div className="relative shrink-0">
            <Image
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              width={56}
              height={56}
              className="rounded-xl object-cover shadow-md"
              unoptimized
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                <MaterialIcon name="graphic_eq" filled className="text-white text-lg" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-sm text-primary truncate">{currentTrack.title}</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5 truncate">{currentTrack.artist}</p>
          </div>
          <span className="font-label text-xs text-on-surface-variant/60 shrink-0 tabular-nums">
            {formatDuration(currentTrack.duration)}
          </span>
        </div>
      </section>

      {/* À venir */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mb-3">
            À venir
          </p>
          <div className="space-y-1">
            {upcoming.map((track, i) => (
              <button
                key={`${track.id}-${i}`}
                onClick={() => play(track, queue)}
                className={cn(
                  'w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group',
                  'hover:bg-surface-container'
                )}
              >
                <div className="relative shrink-0">
                  <Image
                    src={track.albumArt}
                    alt={track.title}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MaterialIcon name="play_arrow" filled className="text-white text-base" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm text-on-surface truncate">{track.title}</p>
                  <p className="font-label text-xs text-on-surface-variant mt-0.5 truncate">{track.artist}</p>
                </div>
                <span className="font-label text-xs text-on-surface-variant/50 shrink-0 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Déjà joués */}
      {played.length > 0 && (
        <section>
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/40 font-bold mb-3">
            Déjà joués
          </p>
          <div className="space-y-1">
            {played.map((track, i) => (
              <button
                key={`${track.id}-played-${i}`}
                onClick={() => play(track, queue)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group hover:bg-surface-container opacity-40 hover:opacity-70"
              >
                <Image
                  src={track.albumArt}
                  alt={track.title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover shrink-0"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm text-on-surface truncate">{track.title}</p>
                  <p className="font-label text-xs text-on-surface-variant mt-0.5 truncate">{track.artist}</p>
                </div>
                <span className="font-label text-xs text-on-surface-variant/50 shrink-0 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && played.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant/40">
          <MaterialIcon name="queue_music" className="text-5xl" />
          <p className="font-label text-sm uppercase tracking-wider">Un seul titre dans la file</p>
        </div>
      )}
    </div>
  )
}