'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { usePlayer } from '@/context/PlayerContext'
import { usePanel } from '@/context/PanelContext'
import { useArtist } from '@/context/ArtistContext'
import { formatDuration, formatPlays } from '@/lib/utils'
import { JOCHA_TRACKS } from '@/data/tracks'
import { getLyrics, getCurrentLineIndex } from '@/data/lyrics'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

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

export default function FullscreenPlayer() {
  const { closeFullscreen } = usePanel()
  const { profile } = useArtist()
  const [showArtist, setShowArtist] = useState(false)
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
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    queue,
    play,
    playCounts,
  } = usePlayer()

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const lyrics = getLyrics(currentTrack.id)
  const activeLineIdx = lyrics ? getCurrentLineIndex(lyrics, currentTime) : -1
  const waveform = buildWaveform(WAVEFORM_COUNT, currentTrack.id)
  const waveProgressIdx = Math.floor((progress / 100) * WAVEFORM_COUNT)

  const currentIdx = queue.findIndex((t) => t.id === currentTrack.id)
  const upNext = queue.slice(currentIdx + 1, currentIdx + 4)

  // Desktop: fenêtre de paroles (1 avant active, active, 3 après) — lignes non vides uniquement
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

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(Math.floor(ratio * duration))
  }

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col overflow-hidden">

      {/* Fond blur */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentTrack.albumArt}
          alt=""
          className="w-full h-full object-cover scale-125 blur-3xl opacity-35"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* Bouton fermer en haut à droite */}
      <div className="relative z-10 flex justify-end px-6 pt-4 shrink-0">
        <button
          onClick={closeFullscreen}
          className="w-10 h-10 rounded-full bg-surface-container/70 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Fermer le plein écran"
        >
          <MaterialIcon name="close_fullscreen" />
        </button>
      </div>

      {/* Corps principal : deux colonnes */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* ── Colonne gauche : pochette + titre ── */}
        <section className="w-1/2 flex items-center justify-center p-8 xl:p-16 shrink-0">
          <div className="relative group w-full max-w-[480px]">
            {/* Pochette */}
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
            {/* Titre éditorial */}
            <div className="mt-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold font-label">
                En lecture
              </span>
              <h2 className="font-headline text-5xl font-black tracking-tighter mt-2 text-on-background leading-none">
                {currentTrack.title}
              </h2>
            </div>
          </div>
        </section>

        {/* ── Colonne droite : scrollable ── */}
        <section className="w-1/2 flex flex-col py-4 pr-16 pl-4 overflow-y-auto no-scrollbar">

          {/* Metadata track */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold tracking-widest text-on-surface-variant rounded">
                44.1 KHZ
              </span>
              <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold tracking-widest text-on-surface-variant rounded">
                LOSSLESS
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-primary mb-1">{currentTrack.artist}</h1>
            <div className="flex items-center justify-between">
              <p className="text-on-surface-variant text-lg">{currentTrack.albumTitle}</p>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={cn(
                  'transition-all active:scale-90',
                  currentTrack.isFavorite ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                )}
              >
                <MaterialIcon name="favorite" filled={currentTrack.isFavorite} size="lg" />
              </button>
            </div>
          </div>

          {/* Waveform visualizer + seek */}
          <div className="mb-8">
            <div
              className="flex items-end gap-[3px] h-20 mb-3 cursor-pointer"
              onClick={handleSeek}
            >
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
                        ? idx % 3 === 0
                          ? 'bg-primary shadow-[0_0_8px_rgba(182,160,255,0.3)]'
                          : 'bg-primary/70'
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

          {/* Paroles — fenêtre défilante */}
          {lyrics ? (
            <div className="mb-12 space-y-4">
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
            <div className="mb-12 flex items-center gap-2 text-on-surface-variant/40">
              <MaterialIcon name="lyrics" />
              <span className="font-label text-sm uppercase tracking-widest">
                Paroles non disponibles
              </span>
            </div>
          )}

          {/* Up Next */}
          {upNext.length > 0 && (
            <div className="mb-12">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold font-label mb-4">
                Up Next
              </h3>
              <div className="space-y-3">
                {upNext.map((track, i) => (
                  <button
                    key={track.id}
                    onClick={() => play(track, queue)}
                    className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-on-surface-variant w-4">
                        {String(i + 2).padStart(2, '0')}
                      </span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                        <Image
                          src={track.albumArt}
                          alt={track.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">
                          {track.title}
                        </p>
                        <p className="text-xs text-on-surface-variant">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant font-bold">
                        {formatDuration(track.duration)}
                      </span>
                      <MaterialIcon
                        name="play_arrow"
                        className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* À propos de l'artiste */}
          <div className="mb-8">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold font-label mb-4">
              À propos de l&apos;artiste
            </h3>
            <button
              onClick={() => setShowArtist(true)}
              className="w-full text-left rounded-2xl overflow-hidden bg-surface-container-low hover:brightness-110 transition-all"
            >
              <div className="relative h-36 w-full">
                {profile.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-container-low to-transparent" />
              </div>
              <div className="px-6 pb-6 -mt-8 relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-surface-container-low shadow-xl bg-surface-container-high mb-3">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MaterialIcon name="person" className="text-on-surface-variant/40 text-2xl" />
                    </div>
                  )}
                </div>
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-0.5">
                  Artiste Vérifié
                </p>
                <h3 className="font-headline text-2xl font-black tracking-tighter text-on-background uppercase mb-1">
                  {profile.name}
                </h3>
                <p className="font-label text-xs text-on-surface-variant mb-3">
                  {formatPlays(JOCHA_TRACKS.reduce((s, t) => s + (playCounts[t.id] ?? 0), 0))} écoutes totales
                </p>
                {profile.bio && (
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-4 mb-4">
                    {profile.bio}
                  </p>
                )}
                {profile.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.genres.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-surface-container rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* ── Barre de contrôles en bas ── */}
      <div className="relative z-10 shrink-0 border-t border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl px-8 py-4">
        {/* Barre de progression */}
        <div className="flex items-center gap-4 mb-3 max-w-2xl mx-auto">
          <span className="font-label text-[10px] text-on-surface-variant w-8 text-right shrink-0">
            {formatDuration(currentTime)}
          </span>
          <div
            className="flex-1 h-1.5 bg-surface-variant rounded-full cursor-pointer group/bar relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="font-label text-[10px] text-on-surface-variant w-8 shrink-0">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Contrôles + volume */}
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Volume */}
          <div className="flex items-center gap-2 w-40">
            <MaterialIcon name="volume_down" className="text-on-surface-variant text-sm shrink-0" />
            <div
              className="flex-1 h-1 bg-surface-variant rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setVolume((e.clientX - rect.left) / rect.width)
              }}
            >
              <div
                className="h-full bg-on-surface-variant rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <MaterialIcon name="volume_up" className="text-on-surface-variant text-sm shrink-0" />
          </div>

          {/* Boutons de lecture */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={cn(
                'transition-colors',
                isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <MaterialIcon name="shuffle" />
            </button>
            <button onClick={prev} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon name="skip_previous" size="lg" />
            </button>
            <button
              onClick={toggle}
              className="w-14 h-14 rounded-full bg-on-surface text-surface flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg"
            >
              <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} filled size="lg" />
            </button>
            <button onClick={next} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon name="skip_next" size="lg" />
            </button>
            <button
              onClick={toggleRepeat}
              className={cn(
                'transition-colors',
                repeatMode !== 'off' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <MaterialIcon name={repeatMode === 'one' ? 'repeat_one' : 'repeat'} />
            </button>
          </div>

          {/* Espace symétrique avec volume */}
          <div className="w-40" />
        </div>
      </div>

      {/* Popup artiste */}
      {showArtist && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowArtist(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[85vh] flex flex-col bg-surface-container rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative h-40 shrink-0">
              {profile.coverPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-container to-transparent" />
              <button
                onClick={() => setShowArtist(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-background/80 transition-colors"
              >
                <MaterialIcon name="close" className="text-sm" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 -mt-10 relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-container shadow-xl bg-surface-container-high mb-3">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-3xl" />
                  </div>
                )}
              </div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-1">
                Artiste Vérifié
              </p>
              <h2 className="font-headline text-3xl font-black tracking-tighter text-on-background uppercase leading-none mb-1">
                {profile.name}
              </h2>
              {profile.location && (
                <p className="flex items-center gap-1.5 font-label text-xs text-on-surface-variant mb-4">
                  <MaterialIcon name="location_on" className="text-sm" />
                  {profile.location}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface-container-high rounded-xl p-4">
                  <p className="font-headline text-2xl font-black tracking-tighter text-on-background">
                    {formatPlays(JOCHA_TRACKS.reduce((s, t) => s + (playCounts[t.id] ?? 0), 0))}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    Écoutes
                  </p>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4">
                  <p className="font-headline text-2xl font-black tracking-tighter text-on-background">
                    {JOCHA_TRACKS.length}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    Titres
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-5">
                  {profile.bio}
                </p>
              )}
              {profile.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.genres.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-container rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}