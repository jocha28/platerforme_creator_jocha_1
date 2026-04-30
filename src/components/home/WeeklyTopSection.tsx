'use client'

import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useState, useEffect, useMemo } from 'react'
import { formatPlays } from '@/lib/utils'

export default function WeeklyTopSection() {
  const { weeklyTopTrackIds, playCounts, play, currentTrack, isPlaying } = usePlayer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const topTracks = useMemo(() => {
    if (!mounted) return []
    return weeklyTopTrackIds
      .map(id => JOCHA_TRACKS.find(t => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
  }, [weeklyTopTrackIds, mounted])

  if (topTracks.length === 0) return null

  return (
    <section className="mt-24 px-6 md:px-12 relative">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h3 className="font-headline text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Top de la semaine
          </h3>
          <p className="font-label text-xs text-white/30 uppercase tracking-[0.3em]">
            Les titres les plus plébiscités ces 7 derniers jours
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label text-[10px] text-white/60 uppercase tracking-widest font-black">Live Charts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
        {topTracks.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id
          const plays = playCounts[track.id] ?? 0
          
          return (
            <button
              key={track.id}
              onClick={() => play(track, topTracks)}
              className={`group flex items-center gap-6 p-4 rounded-3xl transition-all relative overflow-hidden border ${
                isCurrent 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'hover:bg-white/5 border-transparent hover:border-white/5'
              }`}
            >
              {/* Rank */}
              <span className={`font-headline font-black text-3xl italic w-10 shrink-0 text-right tabular-nums ${
                i < 3 ? 'text-primary' : 'text-white/10'
              }`}>
                {i + 1}
              </span>

              {/* Cover with subtle rank badge */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
                <Image 
                  src={track.albumArt} 
                  alt={track.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  unoptimized 
                />
                {isCurrent && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                    <MaterialIcon name="graphic_eq" className="text-white animate-pulse" filled />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-headline font-black text-lg truncate transition-colors ${isCurrent ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                  {track.title}
                </h4>
                <p className="font-label text-[10px] text-white/30 uppercase tracking-widest truncate mt-1">
                  {track.albumTitle}
                </p>
              </div>

              {/* Playback Stats */}
              <div className="text-right shrink-0">
                <p className="font-label text-xs font-black text-white">{formatPlays(plays)}</p>
                <p className="font-label text-[9px] text-white/20 uppercase tracking-widest mt-1 font-bold">Écoutes</p>
              </div>

              {/* Hover Play Button */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden md:block">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xl">
                  <MaterialIcon name={isCurrent && isPlaying ? 'pause' : 'play_arrow'} filled />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
