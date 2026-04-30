'use client'

import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useMemo } from 'react'

export default function RecentlyPlayedSection() {
  const { recentTrackIds, play, currentTrack, isPlaying } = usePlayer()

  const recentTracks = useMemo(() => {
    return recentTrackIds
      .map(id => JOCHA_TRACKS.find(t => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
  }, [recentTrackIds])

  if (recentTracks.length === 0) return null

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <h3 className="font-headline text-2xl font-bold tracking-tight">Écoutés récemment</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {recentTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id
          return (
            <button
              key={track.id}
              onClick={() => play(track, recentTracks)}
              className="flex-none w-32 md:w-40 group text-left"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container mb-3 shadow-md">
                <Image 
                  src={track.albumArt} 
                  alt={track.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <MaterialIcon 
                    name={isCurrent && isPlaying ? 'pause_circle' : 'play_circle'} 
                    className={`text-primary text-4xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0`}
                    filled
                  />
                </div>
                {isCurrent && isPlaying && (
                  <div className="absolute bottom-2 right-2">
                    <span className="material-symbols-outlined text-primary text-base animate-pulse" 
                      style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                  </div>
                )}
              </div>
              <p className={`font-headline font-bold text-sm truncate transition-colors ${isCurrent ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                {track.title}
              </p>
              <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-wider truncate mt-0.5">
                {track.albumTitle}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
