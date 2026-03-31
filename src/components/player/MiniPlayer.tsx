'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'

export default function MiniPlayer() {
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
  } = usePlayer()

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(Math.floor(ratio * duration))
  }

  return (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 z-[60] px-3 pb-3 animate-slide-up">
      <div className="max-w-6xl mx-auto bg-surface-container/90 backdrop-blur-2xl rounded-full md:rounded-xl shadow-[0_-4px_40px_rgba(0,0,0,0.6)] border border-outline-variant/10 overflow-hidden">
        {/* Progress Bar */}
        <div
          className="w-full h-1 bg-surface-variant cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-secondary relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-secondary rounded-full shadow-[0_0_10px_#00e3fd]" />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          {/* Track Info — cliquable vers la page de lecture */}
          <Link href="/now-playing" className="flex items-center gap-3 md:gap-4 w-1/3 min-w-0 group">
            <div className="relative h-10 w-10 md:h-12 md:w-12 rounded shrink-0 overflow-hidden shadow-lg">
              <Image
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div className="hidden md:block overflow-hidden">
              <h5 className="font-headline font-bold text-sm leading-tight truncate text-on-background group-hover:text-primary transition-colors">
                {currentTrack.title}
              </h5>
              <p className="font-label text-[10px] text-primary uppercase tracking-wider truncate">
                {currentTrack.albumTitle}
              </p>
            </div>
            <div className="md:hidden overflow-hidden">
              <h5 className="font-headline font-bold text-xs leading-tight truncate text-on-background group-hover:text-primary transition-colors">
                {currentTrack.title}
              </h5>
              <p className="font-label text-[9px] text-primary uppercase tracking-wider truncate">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={toggleShuffle}
              className={`hidden md:block transition-colors ${isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <MaterialIcon name="shuffle" />
            </button>
            <button
              onClick={prev}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <MaterialIcon name="skip_previous" size="lg" />
            </button>
            <button
              onClick={toggle}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-on-surface text-surface flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
              <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} filled size="lg" />
            </button>
            <button
              onClick={next}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <MaterialIcon name="skip_next" size="lg" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`hidden md:block transition-colors ${isRepeat ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <MaterialIcon name="repeat" />
            </button>
          </div>

          {/* Volume & time */}
          <div className="hidden md:flex items-center justify-end gap-4 w-1/3">
            <span className="font-label text-xs text-on-surface-variant">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <div className="flex items-center gap-2">
              <MaterialIcon name="volume_up" className="text-on-surface-variant text-xl" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
