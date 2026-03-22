'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'
import { formatPlays, formatDuration } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useArtist } from '@/context/ArtistContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAdmin } from '@/context/AdminContext'
import EditProfileModal from '@/components/profile/EditProfileModal'
import AdminLoginModal from '@/components/admin/AdminLoginModal'

const WHATSAPP_NUMBER = '33600000000' // ← remplace par ton numéro (sans +, ex: 33612345678)

const TOTAL_TRACKS = JOCHA_TRACKS.length
// Projets = albums + EP + mixtapes (hors singles)
const TOTAL_PROJECTS = MOCK_RELEASES.filter((r) => r.type !== 'single').length

export default function ProfilePage() {
  const { profile } = useArtist()
  const { playCounts } = usePlayer()
  const { isAdmin, logout } = useAdmin()
  const [editOpen, setEditOpen] = useState(false)
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
    () =>
      [...JOCHA_TRACKS]
        .sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0))
        .slice(0, 5),
    [playCounts]
  )

  const stats = [
    { label: 'Écoutes', value: formatPlays(totalPlays), icon: 'headphones' },
    { label: 'Titres', value: String(TOTAL_TRACKS), icon: 'music_note' },
    { label: 'Projets', value: String(TOTAL_PROJECTS), icon: 'album' },
    { label: 'Années actif', value: String(yearsActive || '—'), icon: 'calendar_month' },
  ]

  return (
    <div className="pt-16 pb-40">
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Hero profil */}
      <section className="relative pb-6">
        {/* ── Bannière de couverture ── */}
        <div className="relative h-44 md:h-64 overflow-hidden bg-surface-container-high">
          {profile.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10" />
          )}
          {/* Dégradé bas pour fondu */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          {/* Bouton modifier la couverture */}
          <button
            onClick={openEdit}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-background/60 backdrop-blur-sm rounded-full font-label text-[10px] uppercase tracking-wider text-on-surface hover:bg-background/80 transition-colors"
          >
            <MaterialIcon name="edit" className="text-sm" />
            Couverture
          </button>
        </div>

        {/* ── Avatar chevauchant la bannière ── */}
        <div className="px-6 md:px-12 -mt-16 md:-mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-5 items-center md:items-end">
            {/* Avatar + badge */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-2xl shadow-black/40 bg-surface-container-high">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-5xl" />
                  </div>
                )}
              </div>
              {/* Badge vérifié — en bas à droite de la photo */}
              <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-lg">
                <MaterialIcon name="verified" filled className="text-on-primary text-lg" />
              </div>
            </div>

            {/* Info artiste */}
            <div className="flex-1 text-center md:text-left pb-2">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Artiste Vérifié</p>
              <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-background leading-none uppercase">
                {profile.name}
              </h1>
              {(profile.location || profile.website) && (
                <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 font-label text-xs text-on-surface-variant">
                      <MaterialIcon name="location_on" className="text-sm" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-label text-xs text-primary hover:underline">
                      <MaterialIcon name="link" className="text-sm" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest rounded-full hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MaterialIcon name="chat" className="text-base" />
                  Contact
                </a>
                <button className="px-6 py-2.5 border border-outline-variant/30 text-on-surface font-label text-xs font-bold uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all active:scale-95 flex items-center gap-2">
                  <MaterialIcon name="share" className="text-base" />
                  Partager
                </button>
                <button
                  onClick={openEdit}
                  className="px-6 py-2.5 border border-primary/30 text-primary font-label text-xs font-bold uppercase tracking-widest rounded-full hover:bg-primary/10 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MaterialIcon name="edit" className="text-base" />
                  Modifier
                </button>
                {isAdmin && (
                  <button
                    onClick={logout}
                    className="px-6 py-2.5 border border-error/30 text-error font-label text-xs font-bold uppercase tracking-widest rounded-full hover:bg-error/10 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <MaterialIcon name="logout" className="text-base" />
                    Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-container-high rounded-2xl p-5 flex flex-col gap-3">
              <MaterialIcon name={stat.icon} className="text-primary" />
              <div>
                <p className="font-headline text-3xl font-black tracking-tighter text-on-background">{stat.value}</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top titres */}
      <section className="px-6 md:px-12 mb-12">
        <div className="flex justify-between items-baseline mb-6">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Top Titres</h3>
          <Link href="/discography" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="space-y-2">
          {topTracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer"
            >
              <span className="font-headline text-on-surface-variant text-lg w-6 shrink-0 text-center">{idx + 1}</span>
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                <Image src={track.albumArt} alt={track.title} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">{track.title}</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{track.albumTitle}</p>
              </div>
              <span className="font-label text-xs text-on-surface-variant hidden md:block">{formatPlays(playCounts[track.id] ?? 0)}</span>
              <span className="font-label text-xs text-on-surface-variant">{formatDuration(track.duration)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Discographie */}
      <section className="px-6 md:px-12 mb-12">
        <div className="flex justify-between items-baseline mb-6">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Discographie</h3>
          <Link href="/discography" className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
            Tout voir
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
          {MOCK_RELEASES.map((release) => (
            <Link key={release.id} href={`/album/${release.slug}`} className="flex-none w-36 md:w-44 group">
              <div className="aspect-square rounded-xl overflow-hidden bg-surface-container relative mb-3">
                <Image src={release.coverArt} alt={release.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              </div>
              <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">{release.title}</h4>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{release.year} • {release.type}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* À propos */}
      <section className="px-6 md:px-12">
        <div className="bg-surface-container-high rounded-2xl p-8 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight flex items-center gap-2">
              <MaterialIcon name="info" className="text-primary" />
              À propos
            </h3>
            <button
              onClick={openEdit}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-label text-xs"
            >
              <MaterialIcon name="edit" className="text-sm" />
              Modifier
            </button>
          </div>
          <p className="font-body text-on-surface-variant leading-relaxed text-sm">{profile.bio}</p>
          {profile.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.genres.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-surface-container rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
