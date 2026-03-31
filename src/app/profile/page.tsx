'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'
import { formatPlays, formatDuration, getSingleCertification } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import CertificationDisc from '@/components/ui/CertificationDisc'
import { useArtist } from '@/context/ArtistContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAdmin } from '@/context/AdminContext'
import EditProfileModal from '@/components/profile/EditProfileModal'
import AdminLoginModal from '@/components/admin/AdminLoginModal'

const WHATSAPP_NUMBER = '2290151012435'
const TOTAL_TRACKS    = JOCHA_TRACKS.length
const TOTAL_PROJECTS  = MOCK_RELEASES.filter((r) => r.type !== 'single').length

export default function ProfilePage() {
  const { profile }         = useArtist()
  const { playCounts, play, currentTrack } = usePlayer()
  const { isAdmin, logout } = useAdmin()
  const [editOpen, setEditOpen]   = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  function openEdit() {
    if (isAdmin) setEditOpen(true)
    else setLoginOpen(true)
  }

  const yearsActive = profile.yearsActive
    ? new Date().getFullYear() - parseInt(profile.yearsActive) + 1
    : 0

  const totalPlays = useMemo(
    () => JOCHA_TRACKS.reduce((sum, t) => sum + (playCounts[t.id] ?? 0), 0),
    [playCounts]
  )

  const topTracks = useMemo(
    () => [...JOCHA_TRACKS].sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0)).slice(0, 6),
    [playCounts]
  )

  const certifiedTracks = useMemo(() => {
    return JOCHA_TRACKS
      .map((track) => {
        const plays = playCounts[track.id] ?? 0
        const cert  = getSingleCertification(plays)
        return cert ? { track, plays, cert } : null
      })
      .filter(Boolean)
      .sort((a, b) => {
        const order: Record<string, number> = { diamant: 0, platine: 1, or: 2 }
        const od = order[a!.cert.disc] - order[b!.cert.disc]
        return od !== 0 ? od : b!.plays - a!.plays
      }) as { track: typeof JOCHA_TRACKS[0]; plays: number; cert: NonNullable<ReturnType<typeof getSingleCertification>> }[]
  }, [playCounts])

  const certCounts = useMemo(() => ({
    diamant: certifiedTracks.filter((c) => c.cert.disc === 'diamant').length,
    platine: certifiedTracks.filter((c) => c.cert.disc === 'platine').length,
    or:      certifiedTracks.filter((c) => c.cert.disc === 'or').length,
  }), [certifiedTracks])

  function playTrack(track: typeof JOCHA_TRACKS[0]) {
    play(track, JOCHA_TRACKS)
  }

  const stats = [
    { label: 'Écoutes',      value: formatPlays(totalPlays),       icon: 'headphones'     },
    { label: 'Titres',       value: String(TOTAL_TRACKS),          icon: 'music_note'     },
    { label: 'Projets',      value: String(TOTAL_PROJECTS),        icon: 'album'          },
    { label: 'Années actif', value: String(yearsActive || '—'),    icon: 'calendar_month' },
  ]

  return (
    <div className="pb-40 pt-16 lg:pt-16">
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* ══════════════════════════════
          HERO — bannière + avatar
      ══════════════════════════════ */}
      <section className="relative">

        {/* Bannière */}
        <div className="relative h-52 md:h-72 overflow-hidden bg-surface-container-high">
          {profile.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/10 to-background" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* Boutons action top-right */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full font-label text-[10px] uppercase tracking-wider text-white hover:bg-black/60 transition-colors"
            >
              <MaterialIcon name="edit" className="text-sm" />
              Modifier
            </button>
            {isAdmin && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-error/30 backdrop-blur-md rounded-full font-label text-[10px] uppercase tracking-wider text-white hover:bg-error/50 transition-colors"
              >
                <MaterialIcon name="logout" className="text-sm" />
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Avatar + identité */}
        <div className="px-6 md:px-12 -mt-20 md:-mt-24 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-8">

            {/* Avatar */}
            <div className="relative shrink-0 self-center md:self-end">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-background shadow-2xl shadow-black/50 bg-surface-container-high">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-5xl" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-lg">
                <MaterialIcon name="verified" filled className="text-on-primary text-lg" />
              </div>
            </div>

            {/* Nom + meta */}
            <div className="flex-1 text-center md:text-left pb-2 min-w-0">
              <p className="font-label text-[10px] uppercase tracking-[0.35em] text-primary mb-1">Artiste Vérifié</p>
              <h1
                className="font-headline font-black uppercase tracking-tighter text-on-background leading-none mb-2"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
              >
                {profile.name}
              </h1>

              {/* Localisation / site */}
              {(profile.location || profile.website) && (
                <div className="flex flex-wrap gap-4 mb-4 justify-center md:justify-start">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 font-label text-xs text-on-surface-variant/60">
                      <MaterialIcon name="location_on" className="text-sm" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-label text-xs text-primary hover:underline">
                      <MaterialIcon name="link" className="text-sm" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest rounded-full hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25"
                >
                  <MaterialIcon name="chat" className="text-base" />
                  Contact
                </a>
                <button className="px-6 py-2.5 border border-outline-variant/30 text-on-surface font-label text-xs font-bold uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all active:scale-95 flex items-center gap-2">
                  <MaterialIcon name="share" className="text-base" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section className="px-6 md:px-12 mt-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="relative bg-surface-container-high rounded-2xl p-5 overflow-hidden group">
              {/* Accent coin */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-4 translate-x-4 group-hover:bg-primary/10 transition-colors" />
              <MaterialIcon name={stat.icon} className="text-primary mb-4 text-2xl" />
              <p className="font-headline text-3xl font-black tracking-tighter text-on-background leading-none">{stat.value}</p>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          TOP TITRES
      ══════════════════════════════ */}
      <section className="px-6 md:px-12 mb-12">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="font-headline text-2xl font-bold tracking-tight">Top Titres</h2>
          <Link href="/discography" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
            Voir tout
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {topTracks.map((track, idx) => {
            const maxPlays = playCounts[topTracks[0]?.id] ?? 1
            const pct      = Math.round(((playCounts[track.id] ?? 0) / (maxPlays || 1)) * 100)
            return (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className="relative flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-surface-container-high hover:bg-surface-container group transition-colors text-left overflow-hidden"
              >
                {/* Barre de progression en fond */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/5 group-hover:bg-primary/8 transition-all rounded-2xl"
                  style={{ width: `${pct}%` }}
                />

                {/* Numéro / play */}
                <span className="relative font-mono text-[13px] text-on-surface-variant/25 w-5 shrink-0 text-right group-hover:hidden">
                  {idx + 1}
                </span>
                <MaterialIcon name="play_arrow" filled className="relative text-primary hidden group-hover:block shrink-0 w-5 text-base" />

                {/* Cover */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                </div>

                {/* Titre + album */}
                <div className="relative flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate leading-tight">
                    {track.title}
                  </p>
                  <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-wider mt-0.5 truncate">
                    {track.albumTitle}
                  </p>
                </div>

                {/* Méta droite */}
                <div className="relative flex flex-col items-end gap-0.5 shrink-0">
                  <span className="font-label text-[10px] text-on-surface-variant/40 hidden md:block">
                    {formatPlays(playCounts[track.id] ?? 0)}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant/40">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════
          ARTIST PICK
      ══════════════════════════════ */}
      {profile.artistPick?.releaseSlug && (() => {
        const pick    = profile.artistPick!
        const release = MOCK_RELEASES.find((r) => r.slug === pick.releaseSlug)
        if (!release) return null
        return (
          <section className="px-6 md:px-12 mb-12">
            <h2 className="font-headline text-2xl font-bold tracking-tight mb-6">Artist Pick</h2>
            <Link href={`/album/${release.slug}`} className="block group">
              <div className="relative rounded-2xl overflow-hidden h-48 md:h-60 bg-surface-container-high">
                {pick.backgroundPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pick.backgroundPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
                <div className="absolute inset-0 flex items-center gap-6 px-6 md:px-10">
                  <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                    <Image src={release.coverArt} alt={release.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 rounded-full font-label text-[10px] uppercase tracking-widest text-primary mb-3">
                      <MaterialIcon name="new_releases" className="text-sm" />
                      Artist Pick
                    </span>
                    <h3 className="font-headline text-xl md:text-2xl font-black tracking-tighter text-on-background leading-tight uppercase group-hover:text-primary transition-colors truncate">
                      {release.title}
                    </h3>
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 mb-3">
                      {release.year} · {release.type}
                    </p>
                    {pick.description && (
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-2">{pick.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )
      })()}

      {/* ══════════════════════════════
          DISCOGRAPHIE
      ══════════════════════════════ */}
      <section className="mb-12">
        <div className="flex justify-between items-baseline mb-6 px-6 md:px-12">
          <h2 className="font-headline text-2xl font-bold tracking-tight">Discographie</h2>
          <Link href="/discography" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
            Tout voir <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>

        {/* Albums & EPs — grande grille */}
        {(() => {
          const projects = MOCK_RELEASES.filter((r) => r.type !== 'single')
          if (projects.length === 0) return null
          return (
            <div className="flex gap-4 overflow-x-auto pb-2 px-6 md:px-12 mb-6" style={{ scrollbarWidth: 'none' }}>
              {projects.map((release) => (
                <div key={release.id} className="shrink-0 w-44 md:w-52 group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container mb-3">
                    <Image src={release.coverArt} alt={release.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    {/* Overlay type badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full font-label text-[9px] uppercase tracking-widest text-white/80">
                        {release.type}
                      </span>
                    </div>
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3">
                      <Link
                        href={`/album/${release.slug}`}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MaterialIcon name="arrow_forward" className="text-on-primary text-sm" />
                      </Link>
                    </div>
                  </div>
                  <p className="font-headline font-black text-sm group-hover:text-primary transition-colors truncate leading-tight">{release.title}</p>
                  <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">{release.year}</p>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Singles — liste compacte */}
        {(() => {
          const singles = MOCK_RELEASES.filter((r) => r.type === 'single').slice(0, 8)
          if (singles.length === 0) return null
          return (
            <div className="px-6 md:px-12">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40 mb-3">Singles récents</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {singles.map((r) => (
                  <Link
                    key={r.id}
                    href={`/album/${r.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container group transition-colors"
                  >
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={r.coverArt} alt={r.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-xs group-hover:text-primary transition-colors truncate leading-tight">{r.title}</p>
                      <p className="font-label text-[9px] text-on-surface-variant/40 uppercase tracking-wider mt-0.5">{r.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}
      </section>

      {/* ══════════════════════════════
          À PROPOS
      ══════════════════════════════ */}
      <section className="px-6 md:px-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl font-bold tracking-tight">À propos</h2>
          <button
            onClick={openEdit}
            className="text-on-surface-variant/50 hover:text-primary transition-colors flex items-center gap-1.5 font-label text-xs"
          >
            <MaterialIcon name="edit" className="text-sm" />
            Modifier
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Bloc bio */}
          <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-outline-variant/20 bg-surface-container">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-2xl" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-headline font-black text-xl text-on-background">{profile.name}</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                  {formatPlays(totalPlays)} écoutes
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">{profile.bio || '—'}</p>
            {profile.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.genres.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-surface-container rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bloc infos */}
          <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col gap-4">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50 mb-1">Infos</p>
            {[
              { icon: 'music_note',     label: 'Titres',        value: String(TOTAL_TRACKS)       },
              { icon: 'album',          label: 'Projets',       value: String(TOTAL_PROJECTS)     },
              { icon: 'calendar_month', label: 'Actif depuis',  value: profile.yearsActive || '—' },
              { icon: 'location_on',    label: 'Localisation',  value: profile.location  || '—'  },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <MaterialIcon name={icon} className="text-primary text-sm" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">{label}</span>
                  <span className="font-headline font-bold text-sm text-on-surface">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bloc certifications ── */}
        {certifiedTracks.length > 0 && (
          <div className="mt-6 max-w-4xl bg-surface-container-high rounded-2xl overflow-hidden">

            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <MaterialIcon name="workspace_premium" className="text-primary text-lg" />
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/70">Certifications</p>
              </div>
              <Link
                href="/certifications"
                className="font-label text-[10px] uppercase tracking-widest text-primary hover:brightness-125 transition-all flex items-center gap-1"
              >
                Voir tout <MaterialIcon name="arrow_forward" className="text-xs" />
              </Link>
            </div>

            {/* Compteurs */}
            <div className="flex items-center gap-0 border-b border-outline-variant/10 divide-x divide-outline-variant/10">
              {([
                { disc: 'diamant', label: 'Diamant', count: certCounts.diamant, text: 'text-cyan-300'   },
                { disc: 'platine', label: 'Platine', count: certCounts.platine, text: 'text-slate-300'  },
                { disc: 'or',      label: 'Or',      count: certCounts.or,      text: 'text-yellow-400' },
              ] as const).map(({ disc, label, count, text }) => (
                <div key={disc} className="flex-1 flex items-center gap-3 px-5 py-4">
                  <CertificationDisc type={disc} size={36} />
                  <div>
                    <p className={`font-headline font-black text-xl leading-none ${text}`}>{count}</p>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/50 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Top titres certifiés */}
            <div className="divide-y divide-outline-variant/10">
              {certifiedTracks.slice(0, 4).map(({ track, plays, cert }, idx) => {
                const isCurrent = currentTrack?.id === track.id
                return (
                  <button
                    key={track.id}
                    onClick={() => play(track, certifiedTracks.map((c) => c.track))}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all text-left group ${
                      isCurrent ? 'bg-primary/8' : 'hover:bg-surface-container'
                    }`}
                  >
                    <span className="font-mono text-xs text-on-surface-variant/25 w-4 shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <div className="shrink-0 transition-transform group-hover:scale-110 duration-200">
                      <CertificationDisc type={cert.disc} size={32} />
                    </div>
                    <div className="relative shrink-0 w-9 h-9 rounded-lg overflow-hidden">
                      <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-headline font-bold text-sm leading-tight truncate ${
                        isCurrent ? 'text-primary' : 'text-on-background group-hover:text-primary transition-colors'
                      }`}>
                        {track.title}
                      </p>
                      <p className="font-label text-[9px] text-on-surface-variant/40 uppercase tracking-wider mt-0.5 truncate">
                        {track.albumTitle}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`font-label text-[10px] uppercase tracking-wider font-bold ${cert.color}`}>
                        {cert.label}
                      </p>
                      <p className="font-label text-[9px] text-on-surface-variant/35 mt-0.5">
                        {formatPlays(plays)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

          </div>
        )}

      </section>
    </div>
  )
}
