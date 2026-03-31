'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'
import { usePlayer } from '@/context/PlayerContext'
import { usePlaylist } from '@/context/PlaylistContext'
import MaterialIcon from '@/components/ui/MaterialIcon'

/* ─── Sections du site ─── */
const MAIN_PAGES = [
  { href: '/',               icon: 'home_max',          label: 'Accueil',        desc: 'Dernière sortie, Top titres, Discographie'         },
  { href: '/discography',    icon: 'library_music',     label: 'Discographie',   desc: `${MOCK_RELEASES.length} sorties — Albums, EPs, Singles` },
  { href: '/songs',          icon: 'queue_music',       label: 'Tous les sons',  desc: `${JOCHA_TRACKS.length} titres avec paroles`        },
  { href: '/certifications', icon: 'workspace_premium', label: 'Certifications', desc: 'Titres certifiés Or, Platine, Diamant'             },
  { href: '/profile',        icon: 'person',            label: 'Profil artiste', desc: 'Bio, stats, top titres, discographie'              },
  { href: '/search',         icon: 'search',            label: 'Recherche',      desc: 'Chercher un titre, un album, un genre'             },
  { href: '/library',        icon: 'album',             label: 'Bibliothèque',   desc: 'Playlists et favoris'                              },
  { href: '/download',       icon: 'download',          label: 'Application',    desc: 'Télécharger l\'app mobile Jocha'                   },
  { href: '/now-playing',    icon: 'graphic_eq',        label: 'En lecture',     desc: 'Vue plein écran — paroles synchronisées, waveform' },
]

const ALBUMS = MOCK_RELEASES.filter((r) => r.type === 'album')
const EPS    = MOCK_RELEASES.filter((r) => r.type === 'ep')

export default function ExplorePage() {
  const { playCounts } = usePlayer()
  const { playlists }  = usePlaylist()

  const totalPlays = JOCHA_TRACKS.reduce((s, t) => s + (playCounts[t.id] ?? 0), 0)

  return (
    <div className="min-h-screen pt-16 pb-32 px-6 md:px-12">

      {/* ── Header ── */}
      <div className="pt-8 pb-8 max-w-5xl">
        <p className="font-label text-[10px] uppercase tracking-[0.35em] text-primary mb-2">Navigation</p>
        <h1 className="font-headline font-black uppercase tracking-tighter text-on-background leading-none mb-2"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
          Explorer
        </h1>
        <p className="font-body text-on-surface-variant/60 text-sm">
          Toutes les pages et contenus du site en un seul endroit.
        </p>
      </div>

      <div className="max-w-5xl space-y-10">

        {/* ═══════════════════════════════
            PAGES PRINCIPALES
        ═══════════════════════════════ */}
        <section>
          <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50 mb-4">Pages</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAIN_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-4 px-4 py-4 bg-surface-container-high rounded-2xl hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MaterialIcon name={page.icon} className="text-primary text-lg" />
                </div>
                <div className="min-w-0">
                  <p className="font-headline font-bold text-sm text-on-background group-hover:text-primary transition-colors">{page.label}</p>
                  <p className="font-label text-[10px] text-on-surface-variant/50 mt-0.5 leading-tight">{page.desc}</p>
                </div>
                <MaterialIcon name="chevron_right" className="text-on-surface-variant/25 group-hover:text-primary/50 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════
            ALBUMS
        ═══════════════════════════════ */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
              Albums <span className="text-primary">{ALBUMS.length}</span>
            </h2>
            <Link href="/discography?tab=albums" className="font-label text-[10px] text-primary hover:brightness-125 uppercase tracking-wider transition-all">
              Voir tout →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ALBUMS.map((album) => {
              const albumTracks = JOCHA_TRACKS.filter((t) => t.albumId === album.id)
              const albumPlays  = albumTracks.reduce((s, t) => s + (playCounts[t.id] ?? 0), 0)
              return (
                <Link
                  key={album.id}
                  href={`/album/${album.slug}`}
                  className="flex items-center gap-3 px-3 py-3 bg-surface-container-high rounded-2xl hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                    <Image src={album.coverArt} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-sm text-on-background group-hover:text-primary transition-colors truncate">{album.title}</p>
                    <p className="font-label text-[10px] text-on-surface-variant/40 mt-0.5">
                      {album.year} · {albumTracks.length} titres
                    </p>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-on-surface-variant/25 group-hover:text-primary/50 shrink-0 transition-colors" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════
            EPs
        ═══════════════════════════════ */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
              EPs <span className="text-primary">{EPS.length}</span>
            </h2>
            <Link href="/discography?tab=eps" className="font-label text-[10px] text-primary hover:brightness-125 uppercase tracking-wider transition-all">
              Voir tout →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {EPS.map((ep) => {
              const epTracks = JOCHA_TRACKS.filter((t) => t.albumId === ep.id)
              return (
                <Link
                  key={ep.id}
                  href={`/album/${ep.slug}`}
                  className="flex items-center gap-3 px-3 py-3 bg-surface-container-high rounded-2xl hover:bg-surface-container border border-outline-variant/10 hover:border-secondary/30 transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                    <Image src={ep.coverArt} alt={ep.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-sm text-on-background group-hover:text-secondary transition-colors truncate">{ep.title}</p>
                    <p className="font-label text-[10px] text-on-surface-variant/40 mt-0.5">
                      {ep.year} · {epTracks.length} titres
                    </p>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-on-surface-variant/25 group-hover:text-secondary/50 shrink-0 transition-colors" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════
            PAROLES (accès rapide)
        ═══════════════════════════════ */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
              Paroles <span className="text-primary">{JOCHA_TRACKS.length}</span>
            </h2>
            <Link href="/songs" className="font-label text-[10px] text-primary hover:brightness-125 uppercase tracking-wider transition-all">
              Voir tous les titres →
            </Link>
          </div>
          <p className="font-body text-sm text-on-surface-variant/50 mb-3">
            Chaque titre a sa page de paroles avec annotations.
          </p>
          {/* Aperçu des 6 derniers */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {JOCHA_TRACKS.slice(0, 6).map((track) => (
              <Link
                key={track.id}
                href={`/lyrics/${track.id}`}
                className="flex items-center gap-3 px-3 py-2.5 bg-surface-container-high rounded-xl hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all group"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                </div>
                <p className="font-headline font-bold text-xs text-on-background group-hover:text-primary transition-colors truncate flex-1">
                  {track.title}
                </p>
                <MaterialIcon name="lyrics" className="text-on-surface-variant/25 group-hover:text-primary/50 shrink-0 text-sm transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════
            PLAYLISTS
        ═══════════════════════════════ */}
        {playlists.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
                Playlists <span className="text-primary">{playlists.length}</span>
              </h2>
              <Link href="/library" className="font-label text-[10px] text-primary hover:brightness-125 uppercase tracking-wider transition-all">
                Bibliothèque →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  className="flex items-center gap-3 px-3 py-3 bg-surface-container-high rounded-2xl hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container flex items-center justify-center shadow-md">
                    {pl.cover ? (
                      <Image src={pl.cover} alt={pl.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <MaterialIcon name="queue_music" className="text-on-surface-variant/40 text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-sm text-on-background group-hover:text-primary transition-colors truncate">{pl.name}</p>
                    <p className="font-label text-[10px] text-on-surface-variant/40 mt-0.5">
                      {pl.trackIds.length} titre{pl.trackIds.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-on-surface-variant/25 group-hover:text-primary/50 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════
            STATS
        ═══════════════════════════════ */}
        <section>
          <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50 mb-4">Stats globales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'headphones',      label: 'Écoutes totales', value: totalPlays >= 1_000_000 ? `${(totalPlays/1_000_000).toFixed(1)}M` : `${Math.round(totalPlays/1000)}k` },
              { icon: 'music_note',      label: 'Titres',          value: String(JOCHA_TRACKS.length)  },
              { icon: 'album',           label: 'Projets',         value: String(MOCK_RELEASES.filter(r => r.type !== 'single').length) },
              { icon: 'queue_music',     label: 'Playlists',       value: String(playlists.length)     },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-2">
                <MaterialIcon name={s.icon} className="text-primary text-xl" />
                <p className="font-headline font-black text-2xl text-on-background leading-none">{s.value}</p>
                <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}