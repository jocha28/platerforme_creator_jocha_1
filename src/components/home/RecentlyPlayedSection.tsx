'use client'

import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useState, useEffect, useMemo } from 'react'

export default function RecentlyPlayedSection() {
  const { recentTrackIds, play, currentTrack, isPlaying } = usePlayer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const recentTracks = useMemo(() => {
    if (!mounted) return []
    return recentTrackIds
      .map(id => JOCHA_TRACKS.find(t => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
  }, [recentTrackIds, mounted])

  if (recentTracks.length === 0) return null

  return (
    <section className="mt-20 px-6 md:px-12">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="font-headline text-2xl font-black uppercase tracking-tighter text-white/90">
          Écoutés récemment
        </h3>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {recentTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id
          return (
            <button
              key={track.id}
              onClick={() => play(track, recentTracks)}
              className="flex-none w-32 md:w-40 group text-left relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 mb-3 shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-primary/10">
                <Image 
                  src={track.albumArt} 
                  alt={track.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  unoptimized 
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center text-on-primary">
                    <MaterialIcon 
                      name={isCurrent && isPlaying ? 'pause' : 'play_arrow'} 
                      filled
                    />
                  </div>
                </div>

                {isCurrent && isPlaying && (
                  <div className="absolute bottom-3 right-3 p-1.5 bg-primary rounded-lg shadow-lg">
                    <span className="material-symbols-outlined text-on-primary text-sm animate-pulse" 
                      style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                  </div>
                )}
              </div>
              <h4 className={`font-headline font-bold text-sm truncate transition-colors ${isCurrent ? 'text-primary' : 'text-white/80 group-hover:text-primary'}`}>
                {track.title}
              </h4>
              <p className="font-label text-[10px] text-white/30 uppercase tracking-[0.2em] truncate mt-1">
                {track.albumTitle}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
