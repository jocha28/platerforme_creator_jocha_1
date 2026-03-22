'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'
import { getLyrics, getCurrentLineIndex } from '@/data/lyrics'

/** Pseudo-random waveform heights seeded from track ID */
function buildWaveform(count: number, seed: string): number[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  return Array.from({ length: count }, (_, i) => {
    h = ((h << 5) - h + i * 7919) | 0
    return 10 + Math.abs(h % 80)
  })
}

const WAVEFORM_COUNT = 40

export default function NowPlayingPage() {
  const router = useRouter()
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const mobileLyricsRef = useRef<HTMLDivElement>(null)
  const mobileActiveRef = useRef<HTMLParagraphElement>(null)
  const desktopActiveRef = useRef<HTMLParagraphElement>(null)

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    toggle,
    next,
    prev,
    seek,
    volume,
    setVolume,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    queue,
  } = usePlayer()

  useEffect(() => {
    if (!currentTrack) router.push('/')
  }, [currentTrack, router])

  // Mobile lyrics auto-scroll
  useEffect(() => {
    if (lyricsOpen && mobileActiveRef.current) {
      mobileActiveRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime, lyricsOpen])

  // Desktop lyrics auto-scroll
  useEffect(() => {
    desktopActiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentTime])

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const lyrics = getLyrics(currentTrack.id)
  const activeLineIdx = lyrics ? getCurrentLineIndex(lyrics, currentTime) : -1
  const waveform = buildWaveform(WAVEFORM_COUNT, currentTrack.id)
  const waveProgressIdx = Math.floor((progress / 100) * WAVEFORM_COUNT)

  const upNext = queue.filter((t) => t.id !== currentTrack.id).slice(0, 3)

  // Desktop: 3-line window (1 before active, active, 2 after) — non-empty lines only
  const desktopLyrics = lyrics
    ? lyrics
        .map((line, idx) => ({ ...line, idx }))
        .filter((l) => l.text !== '')
    : []
  const activeDesktopPos = desktopLyrics.findIndex((l) => l.idx === activeLineIdx)
  const lyricsWindow = desktopLyrics.slice(
    Math.max(0, activeDesktopPos - 1),
    activeDesktopPos + 4
  )

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    seek(Math.floor(((e.clientX - rect.left) / rect.width) * duration))
  }

  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE  (< lg)
      ══════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen pb-10 flex flex-col relative overflow-hidden">
        {/* Background cover flou */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image src={currentTrack.albumArt} alt="" fill className="object-cover scale-110 blur-2xl opacity-35" unoptimized />
          <div className="absolute inset-0 bg-background/65" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 px-6 max-w-lg mx-auto w-full pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon name="keyboard_arrow_down" size="lg" />
            </button>
            <div className="text-center">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">En lecture</p>
              <p className="font-label text-xs text-on-surface-variant mt-0.5">{currentTrack.albumTitle}</p>
            </div>
            <Link href={`/album/${currentTrack.albumId}`} className="text-on-surface-variant hover:text-primary transition-colors">
              <MaterialIcon name="queue_music" />
            </Link>
          </div>

          {/* Artwork */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-8 group">
            <Image
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              fill
              className={cn('object-cover transition-all duration-700', isPlaying ? 'scale-105' : 'scale-100')}
              unoptimized
              priority
            />
            <button onClick={toggle} className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
              <div className={cn('w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300', isPlaying ? 'opacity-0 scale-90' : 'opacity-100 scale-100')}>
                <MaterialIcon name="play_arrow" filled size="xl" className="text-primary" />
              </div>
            </button>
            {isPlaying && (
              <div className="absolute bottom-4 right-4 flex items-end gap-0.5 h-5">
                <span className="eq-bar h-full animate-eq-bar-1 text-primary" />
                <span className="eq-bar h-3/4 animate-eq-bar-2 text-primary" />
                <span className="eq-bar h-1/2 animate-eq-bar-3 text-primary" />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="font-headline text-3xl font-black tracking-tighter text-on-background truncate">{currentTrack.title}</h2>
              <p className="font-label text-sm text-on-surface-variant mt-1 uppercase tracking-widest">{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={cn('ml-4 mt-1 transition-all active:scale-90', currentTrack.isFavorite ? 'text-primary' : 'text-on-surface-variant hover:text-primary')}
            >
              <MaterialIcon name="favorite" filled={currentTrack.isFavorite} size="lg" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="relative w-full h-1.5 bg-surface-variant rounded-full cursor-pointer group/bar" onClick={handleSeek}>
              <div className="h-full bg-primary rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-label text-xs text-on-surface-variant">{formatDuration(currentTime)}</span>
              <span className="font-label text-xs text-on-surface-variant">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={toggleShuffle} className={cn('p-2 transition-colors', isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')}>
              <MaterialIcon name="shuffle" />
            </button>
            <button onClick={prev} className="text-on-surface hover:text-primary transition-colors p-2">
              <MaterialIcon name="skip_previous" size="xl" />
            </button>
            <button onClick={toggle} className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/30">
              <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} filled size="xl" />
            </button>
            <button onClick={next} className="text-on-surface hover:text-primary transition-colors p-2">
              <MaterialIcon name="skip_next" size="xl" />
            </button>
            <button onClick={toggleRepeat} className={cn('p-2 transition-colors', isRepeat ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')}>
              <MaterialIcon name="repeat" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mb-8">
            <MaterialIcon name="volume_down" className="text-on-surface-variant shrink-0" />
            <div className="flex-1 h-1 bg-surface-variant rounded-full cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left) / r.width) }}>
              <div className="h-full bg-on-surface-variant rounded-full" style={{ width: `${volume * 100}%` }} />
            </div>
            <MaterialIcon name="volume_up" className="text-on-surface-variant shrink-0" />
          </div>

          {/* Lyrics accordion */}
          <div className="rounded-2xl overflow-hidden border border-outline-variant/10 mb-8">
            <button
              onClick={() => setLyricsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-4 bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="lyrics" className={cn('transition-colors', lyricsOpen ? 'text-primary' : 'text-on-surface-variant')} />
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface">Paroles</span>
                {!lyrics && <span className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider">— non disponibles</span>}
                {lyrics && lyricsOpen && <span className="font-label text-[10px] text-primary uppercase tracking-wider">— {formatDuration(currentTime)}</span>}
              </div>
              <MaterialIcon name="keyboard_arrow_down" className={cn('text-on-surface-variant transition-transform duration-300', lyricsOpen ? 'rotate-180' : '')} />
            </button>
            {lyricsOpen && (
              <div className="bg-surface-container-low">
                {lyrics ? (
                  <div ref={mobileLyricsRef} className="overflow-y-auto no-scrollbar px-5 py-4 space-y-0.5" style={{ maxHeight: '50vh' }}>
                    <div className="sticky top-0 h-6 bg-gradient-to-b from-surface-container-low to-transparent pointer-events-none z-10" />
                    {lyrics.map((line, idx) => {
                      const isActive = idx === activeLineIdx
                      const isPast = idx < activeLineIdx
                      return (
                        <p
                          key={idx}
                          ref={isActive ? mobileActiveRef : null}
                          onClick={() => line.time > 0 && seek(line.time)}
                          className={cn(
                            'font-headline font-black text-xl leading-snug tracking-tight transition-all duration-500 cursor-pointer select-none px-2 py-1 rounded-lg',
                            line.text === '' ? 'h-5' : '',
                            isActive
                              ? 'text-on-background opacity-100 bg-primary/8'
                              : isPast
                              ? 'text-on-surface-variant/30 opacity-40'
                              : 'text-on-surface-variant/50 opacity-55 hover:opacity-80'
                          )}
                        >
                          {line.text}
                        </p>
                      )
                    })}
                    <div className="sticky bottom-0 h-8 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center px-6">
                    <MaterialIcon name="lyrics" size="xl" className="text-on-surface-variant/20" />
                    <p className="font-label text-sm text-on-surface-variant/50 uppercase tracking-widest">Paroles non disponibles pour ce titre</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Queue */}
          {upNext.length > 0 && (
            <div className="mb-8">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Suivant dans la file</p>
              <div className="space-y-2">
                {upNext.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-xs truncate">{track.title}</p>
                      <p className="font-label text-[10px] text-on-surface-variant">{formatDuration(track.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP  (≥ lg)
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex h-[calc(100vh-6rem)] relative overflow-hidden">
        {/* Background cover flou */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentTrack.albumArt} alt="" className="w-full h-full object-cover scale-125 blur-3xl opacity-35" />
          <div className="absolute inset-0 bg-background/65" />
        </div>

        {/* ── Left: album art ── */}
        <section className="relative z-10 w-1/2 flex items-center justify-center p-12 xl:p-20 shrink-0">
          <div className="relative group w-full max-w-[520px]">
            {/* Glow halo */}
            {/* Art */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                fill
                className={cn('object-cover transition-all duration-1000', isPlaying ? 'scale-105' : 'scale-100')}
                unoptimized
                priority
              />
              {isPlaying && (
                <div className="absolute bottom-4 right-4 flex items-end gap-0.5 h-5">
                  <span className="eq-bar h-full animate-eq-bar-1 text-primary" />
                  <span className="eq-bar h-3/4 animate-eq-bar-2 text-primary" />
                  <span className="eq-bar h-1/2 animate-eq-bar-3 text-primary" />
                </div>
              )}
            </div>
            {/* Editorial caption */}
            <div className="mt-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold font-label">En lecture</span>
              <h2 className="font-headline text-5xl font-black tracking-tighter mt-2 text-on-background leading-none">
                {currentTrack.title}
              </h2>
            </div>
          </div>
        </section>

        {/* ── Right: scrollable content ── */}
        <section className="relative z-10 w-1/2 flex flex-col py-12 pr-16 pl-4 overflow-y-auto no-scrollbar">

          {/* Track metadata */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold tracking-widest text-on-surface-variant rounded">44.1 KHZ</span>
              <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold tracking-widest text-on-surface-variant rounded">LOSSLESS</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-primary mb-1">{currentTrack.artist}</h1>
            <div className="flex items-center justify-between">
              <p className="text-on-surface-variant text-lg">{currentTrack.albumTitle}</p>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={cn('transition-all active:scale-90', currentTrack.isFavorite ? 'text-primary' : 'text-on-surface-variant hover:text-primary')}
              >
                <MaterialIcon name="favorite" filled={currentTrack.isFavorite} size="lg" />
              </button>
            </div>
          </div>

          {/* Waveform visualizer */}
          <div className="mb-10">
            <div className="flex items-end gap-[3px] h-20 mb-3 cursor-pointer" onClick={handleSeek}>
              {waveform.map((height, idx) => {
                const past = idx < waveProgressIdx
                const current = idx === waveProgressIdx
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex-1 rounded-full transition-colors duration-100',
                      current
                        ? 'bg-secondary shadow-[0_0_15px_rgba(0,227,253,0.6)]'
                        : past
                        ? idx % 3 === 0 ? 'bg-primary shadow-[0_0_8px_rgba(182,160,255,0.3)]' : 'bg-primary/70'
                        : 'bg-surface-variant/60 hover:bg-surface-variant'
                    )}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-label">
              <span>{formatDuration(currentTime)}</span>
              <span>-{formatDuration(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          {/* Lyrics — inline editorial style */}
          {lyrics ? (
            <div className="mb-14 space-y-4">
              {lyricsWindow.map((line) => {
                const isActive = line.idx === activeLineIdx
                const isPast = line.idx < activeLineIdx
                return (
                  <p
                    key={line.idx}
                    ref={isActive ? desktopActiveRef : null}
                    onClick={() => seek(line.time)}
                    className={cn(
                      'font-headline font-bold text-3xl leading-snug tracking-tight transition-all duration-500 cursor-pointer select-none',
                      isActive
                        ? 'text-on-background opacity-100'
                        : isPast
                        ? 'text-on-background/30 opacity-60'
                        : 'text-on-background/20 opacity-50'
                    )}
                  >
                    {line.text}
                  </p>
                )
              })}
            </div>
          ) : (
            <div className="mb-14 flex items-center gap-2 text-on-surface-variant/40">
              <MaterialIcon name="lyrics" />
              <span className="font-label text-sm uppercase tracking-widest">Paroles non disponibles</span>
            </div>
          )}

          {/* Up Next */}
          {upNext.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold font-label mb-4">Up Next</h3>
              <div className="space-y-3">
                {upNext.map((track, i) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-on-surface-variant w-4">{String(i + 2).padStart(2, '0')}</span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                        <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface uppercase tracking-tight">{track.title}</p>
                        <p className="text-xs text-on-surface-variant">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant font-bold">{formatDuration(track.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
