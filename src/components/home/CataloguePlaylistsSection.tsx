'use client'

import Link from 'next/link'
import { usePlaylist } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import { JOCHA_TRACKS } from '@/data/tracks'
import MaterialIcon from '@/components/ui/MaterialIcon'
import SystemPlaylistCover from '@/components/ui/SystemPlaylistCover'

const CATALOGUE_IDS = [
  'pl-singles-jocha',
  'pl-albums-jocha',
  'pl-eps-jocha',
  'pl-catalogue-jocha',
]

export default function CataloguePlaylistsSection() {
  const { playlists } = usePlaylist()
  const { play, currentTrack, isPlaying } = usePlayer()

  const cataloguePlaylists = CATALOGUE_IDS
    .map((id) => playlists.find((p) => p.id === id))
    .filter(Boolean) as typeof playlists

  if (cataloguePlaylists.length === 0) return null

  function handlePlay(pl: typeof playlists[0]) {
    const tracks = pl.trackIds
      .map((id) => JOCHA_TRACKS.find((t) => t.id === id))
      .filter(Boolean) as typeof JOCHA_TRACKS
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <section className="mt-16 px-6 md:px-12">
      <div className="flex justify-between items-baseline mb-6">
        <h3 className="font-headline text-2xl font-bold tracking-tight">Playlists Jocha</h3>
        <Link
          href="/library"
          className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
        >
          Voir tout <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cataloguePlaylists.map((pl) => {
          const isCurrentlyPlaying = currentTrack && pl.trackIds.includes(currentTrack.id) && isPlaying

          return (
            <div key={pl.id} className="group">
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