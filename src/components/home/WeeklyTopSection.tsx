'use client'

import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useMemo } from 'react'
import { formatPlays } from '@/lib/utils'

export default function WeeklyTopSection() {
  const { weeklyTopTrackIds, playCounts, play, currentTrack, isPlaying } = usePlayer()

  const topTracks = useMemo(() => {
    return weeklyTopTrackIds
      .map(id => JOCHA_TRACKS.find(t => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
  }, [weeklyTopTrackIds])

  if (topTracks.length === 0) return null

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Top de la semaine</h3>
          <span className="px-2 py-0.5 bg-secondary/10 rounded-full font-label text-[10px] text-secondary uppercase tracking-widest">7 derniers jours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topTracks.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id
          const plays = playCounts[track.id] ?? 0
          
          return (
            <button
              key={track.id}
              onClick={() => play(track, topTracks)}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all border ${
                isCurrent 
                  ? 'bg-secondary/5 border-secondary/20' 
                  : 'bg-surface-container-low border-transparent hover:border-outline-variant/30 hover:bg-surface-container'
              } group text-left`}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <Image 
                  src={track.albumArt} 
                  alt={track.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  unoptimized 
                />
                {isCurrent && isPlaying && (
                  <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-2xl animate-pulse" 
                      style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                  </div>
                )}
                <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 backdrop-blur-md rounded-md flex items-center justify-center font-headline font-black text-[10px] text-white/80">
                  {i + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-headline font-bold text-sm truncate transition-colors ${isCurrent ? 'text-secondary' : 'text-on-surface group-hover:text-secondary'}`}>
                  {track.title}
                </p>
                <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider truncate mt-0.5">
                  {track.albumTitle}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-label text-xs font-bold text-secondary">{formatPlays(plays)}</p>
                <p className="font-label text-[9px] text-on-surface-variant/40 uppercase tracking-widest mt-0.5">écoutes</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
