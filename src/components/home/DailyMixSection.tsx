'use client'

import Link from 'next/link'
import { usePlaylist } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import SystemPlaylistCover from '@/components/ui/SystemPlaylistCover'

const DAILY_IDS = [
  'pl-daily-drill',
  'pl-daily-trap',
  'pl-daily-conscious',
  'pl-daily-french',
  'pl-daily-cloud',
]

export default function DailyMixSection() {
  const { playlists } = usePlaylist()
  const { play, currentTrack, isPlaying } = usePlayer()

  const dailyMixes = DAILY_IDS
    .map((id) => playlists.find((p) => p.id === id))
    .filter(Boolean) as typeof playlists

  if (dailyMixes.length === 0) return null

  function handlePlay(pl: typeof playlists[0]) {
    const tracks = pl.trackIds
      .map((id) => JOCHA_TRACKS.find((t) => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Daily Mixes</h3>
          <span className="px-2 py-0.5 bg-primary/10 rounded-full font-label text-[10px] text-primary uppercase tracking-widest flex items-center gap-1">
            <MaterialIcon name="bolt" className="text-[10px]" />
            Mis à jour aujourd'hui
          </span>
        </div>
        <Link
          href="/library"
          className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
        >
          Voir tout <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5">
        {dailyMixes.map((pl) => {
          const isCurrentlyPlaying = currentTrack && pl.trackIds.includes(currentTrack.id) && isPlaying

          return (
            <div key={pl.id} className="flex-none w-44 md:w-auto group">
              <div className="relative mb-3 shadow-lg rounded-2xl overflow-hidden">
                <SystemPlaylistCover playlist={pl} />

                {/* Play button au hover */}
                <button
                  onClick={() => handlePlay(pl)}
                  className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <MaterialIcon
                      name={isCurrentlyPlaying ? 'pause' : 'play_arrow'}
                      filled
                      className="text-on-primary text-2xl"
                    />
                  </div>
                </button>

                {/* Equalizer si en cours */}
                {isCurrentlyPlaying && (
                  <div className="absolute top-2 right-2">
                    <MaterialIcon name="graphic_eq" filled className="text-white text-xl" />
                  </div>
                )}
              </div>

              <Link href={`/playlist/${pl.id}`} className="block">
                <h4 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                  {pl.name}
                </h4>
                <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider mt-0.5">
                  {pl.trackIds.length} titres
                </p>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}