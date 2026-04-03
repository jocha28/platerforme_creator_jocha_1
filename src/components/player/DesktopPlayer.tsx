'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export default function DesktopPlayer() {
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
  } = usePlayer()

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(Math.floor(ratio * duration))
  }

  return (
    <div className="hidden lg:flex fixed bottom-0 left-0 right-0 h-24 z-50 bg-surface-container/95 backdrop-blur-2xl border-t border-outline-variant/10 items-center px-6 gap-4">

      {/* Left — Track info */}
      <div className="flex items-center gap-4 w-72 shrink-0">
        <Link href="/now-playing" className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 shadow-lg hover:shadow-primary/20 transition-shadow">
          <Image
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            fill
            className="object-cover"
            unoptimized
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href="/now-playing" className="block">
            <p className="font-headline font-bold text-sm truncate text-on-background hover:text-primary transition-colors">
              {currentTrack.title}
            </p>
          </Link>
          <p className="font-label text-[10px] text-primary uppercase tracking-wider truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className={cn(
            'shrink-0 transition-all active:scale-90',
            currentTrack.isFavorite ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          )}
        >
          <MaterialIcon name="favorite" filled={currentTrack.isFavorite} />
        </button>
      </div>

      {/* Center — Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={cn('transition-colors', isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')}
          >
            <MaterialIcon name="shuffle" />
          </button>
          <button onClick={prev} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <MaterialIcon name="skip_previous" size="lg" />
          </button>
          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full bg-on-surface text-surface flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg"
          >
            <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} filled size="lg" />
          </button>
          <button onClick={next} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <MaterialIcon name="skip_next" size="lg" />
          </button>
          <button
            onClick={toggleRepeat}
            className={cn('transition-colors', repeatMode !== 'off' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')}
          >
            <MaterialIcon name={repeatMode === 'one' ? 'repeat_one' : 'repeat'} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-3 max-w-xl">
          <span className="font-label text-[10px] text-on-surface-variant w-8 text-right shrink-0">
            {formatDuration(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-surface-variant rounded-full cursor-pointer group/bar relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="font-label text-[10px] text-on-surface-variant w-8 shrink-0">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right — Extra controls + volume */}
      <div className="flex items-center gap-3 w-64 justify-end shrink-0">
        <Link
          href="/now-playing"
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="Paroles"
        >
          <MaterialIcon name="lyrics" />
        </Link>
        <Link
          href={`/album/${currentTrack.albumId}`}
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="File d'attente"
        >
          <MaterialIcon name="queue_music" />
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <MaterialIcon name="volume_down" className="text-on-surface-variant text-sm" />
          <div
            className="w-20 h-1 bg-surface-variant rounded-full cursor-pointer"
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
          <MaterialIcon name="volume_up" className="text-on-surface-variant text-sm" />
        </div>
        <Link href="/now-playing" className="text-on-surface-variant hover:text-primary transition-colors ml-1" title="Plein écran">
          <MaterialIcon name="open_in_full" />
        </Link>
      </div>
    </div>
  )
}
