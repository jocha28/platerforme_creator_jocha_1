'use client'

import Image from 'next/image'
import LogoOwl from '@/components/ui/LogoOwl'
import { JOCHA_TRACKS } from '@/data/tracks'

interface Playlist {
  id: string
  name: string
  trackIds: string[]
  cover?: string
}

interface Props {
  playlist: Playlist
  className?: string
}

// Daily Mixes — métadonnées label/bandeau uniquement
const DAILY_META: Record<string, {
  band: string
  logoColor: string
  label: string
  num: string
  baseBg: string
}> = {
  'pl-daily-drill':     { band: 'bg-red-900/90',    logoColor: 'text-red-300',    label: 'Drill',      num: '01', baseBg: '#0a0000' },
  'pl-daily-trap':      { band: 'bg-violet-900/90', logoColor: 'text-violet-300', label: 'Trap',       num: '02', baseBg: '#07000f' },
  'pl-daily-conscious': { band: 'bg-emerald-900/90',logoColor: 'text-emerald-300',label: 'Conscious',  num: '03', baseBg: '#000d05' },
  'pl-daily-french':    { band: 'bg-blue-900/90',   logoColor: 'text-blue-300',   label: 'French Rap', num: '04', baseBg: '#000510' },
  'pl-daily-cloud':     { band: 'bg-slate-900/90',  logoColor: 'text-indigo-300', label: 'Cloud Rap',  num: '05', baseBg: '#03000f' },
}

// Rendu artistique — lumières atmosphériques pures, pas de formes géométriques
function DailyArtwork({ id }: { id: string }) {

  /* ── DRILL — néon rouge sang, nuit urbaine ── */
  if (id === 'pl-daily-drill') return (
    <>
      {/* Base très sombre, zéro couleur */}
      <div className="absolute inset-0" style={{ background: '#050000' }} />
      {/* Source principale : neon rouge vif en haut à droite */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,30,30,0.85) 0%, rgba(180,0,0,0.5) 40%, transparent 70%)', filter: 'blur(28px)' }} />
      {/* Reflet rouge sur le sol, bas gauche */}
      <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(210,30,0,0.6) 0%, transparent 65%)', filter: 'blur(22px)' }} />
      {/* Brume chaude ambrée très diffuse au centre */}
      <div className="absolute top-1/3 left-1/4 w-32 h-20 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(180,50,0,0.25) 0%, transparent 70%)', filter: 'blur(18px)' }} />
      {/* Vignette forte pour l'atmosphère */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
    </>
  )

  /* ── TRAP — explosion UV violet/magenta, studio nocturne ── */
  if (id === 'pl-daily-trap') return (
    <>
      <div className="absolute inset-0" style={{ background: '#04000a' }} />
      {/* Explosion magenta bas-gauche */}
      <div className="absolute -bottom-8 -left-8 w-52 h-52 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.9) 0%, rgba(168,0,120,0.5) 40%, transparent 70%)', filter: 'blur(30px)' }} />
      {/* Halo violet électrique haut-droite */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(80,0,180,0.45) 45%, transparent 70%)', filter: 'blur(26px)' }} />
      {/* Lueur cœur — blanc-bleu froid au centre */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,180,255,0.3) 0%, transparent 70%)', filter: 'blur(14px)' }} />
      {/* Fine couche de cyan en contre-jour */}
      <div className="absolute top-4 right-12 w-24 h-16 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.2) 0%, transparent 70%)', filter: 'blur(16px)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(0,0,0,0.6) 100%)' }} />
    </>
  )

  /* ── CONSCIOUS — lever de soleil doré sur forêt sombre ── */
  if (id === 'pl-daily-conscious') return (
    <>
      <div className="absolute inset-0" style={{ background: '#010a03' }} />
      {/* Soleil levant — grand halo doré flou au centre-haut */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-52 h-36 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.85) 0%, rgba(217,119,6,0.5) 40%, transparent 70%)', filter: 'blur(30px)' }} />
      {/* Diffusion lumineuse ambrée secondaire */}
      <div className="absolute top-4 left-1/4 w-36 h-24 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.45) 0%, transparent 70%)', filter: 'blur(22px)' }} />
      {/* Profondeur verte — terre vivante en bas */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(6,95,70,0.7) 0%, rgba(0,50,20,0.4) 50%, transparent 75%)', filter: 'blur(24px)' }} />
      {/* Reflet vert droit */}
      <div className="absolute bottom-8 right-4 w-24 h-24 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)', filter: 'blur(18px)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 45%, transparent 20%, rgba(0,0,0,0.65) 100%)' }} />
    </>
  )

  /* ── FRENCH RAP — réverbère parisien, pluie et béton ── */
  if (id === 'pl-daily-french') return (
    <>
      <div className="absolute inset-0" style={{ background: '#000208' }} />
      {/* Réverbère froid — lumière blanche/bleutée en haut au centre */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(224,242,255,0.7) 0%, rgba(96,165,250,0.45) 35%, transparent 70%)', filter: 'blur(22px)' }} />
      {/* Reflet de la pluie sur le sol — lueur bleue bas-centre */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-28 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.4) 0%, rgba(30,64,175,0.25) 50%, transparent 75%)', filter: 'blur(20px)' }} />
      {/* Lumière chaleureuse d'un café, bas-gauche */}
      <div className="absolute bottom-8 -left-4 w-28 h-28 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(234,88,12,0.25) 50%, transparent 70%)', filter: 'blur(20px)' }} />
      {/* Contre-lueur orange droite */}
      <div className="absolute top-1/2 -right-4 w-24 h-32 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.3) 0%, transparent 70%)', filter: 'blur(18px)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 20%, rgba(0,0,0,0.72) 100%)' }} />
    </>
  )

  /* ── CLOUD RAP — aurores boréales, espace et rêve ── */
  if (id === 'pl-daily-cloud') return (
    <>
      <div className="absolute inset-0" style={{ background: '#02000d' }} />
      {/* Rideau aurore 1 — violet/indigo, en haut */}
      <div className="absolute top-0 left-0 right-0 h-28"
        style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.55) 0%, transparent 100%)', filter: 'blur(18px)' }} />
      {/* Rideau aurore 2 — rose/fuchsia, décalé */}
      <div className="absolute top-6 left-0 right-0 h-20"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(236,72,153,0.4) 50%, transparent 100%)', filter: 'blur(22px)' }} />
      {/* Rideau aurore 3 — teal/cyan, plus bas */}
      <div className="absolute top-14 left-0 right-0 h-16"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.35) 50%, transparent 100%)', filter: 'blur(20px)' }} />
      {/* Orbe violet à droite — profondeur */}
      <div className="absolute -top-4 -right-4 w-36 h-36 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 65%)', filter: 'blur(28px)' }} />
      {/* Lueur rose à gauche — contrepoids */}
      <div className="absolute top-8 -left-6 w-28 h-28 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.4) 0%, transparent 65%)', filter: 'blur(24px)' }} />
      {/* Sol spatial sombre en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(0deg, rgba(2,0,13,0.9) 0%, transparent 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 40%, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />
    </>
  )

  return null
}

// Playlists catalogue — grille 2×2 + bandeau + icône
const CATALOGUE_META: Record<string, {
  band: string
  logoColor: string
  label: string
  sublabel: string
  icon: string
}> = {
  'pl-singles-jocha':  {
    band: 'bg-gradient-to-r from-yellow-500 to-amber-600',
    logoColor: 'text-yellow-300',
    label: 'Singles',
    sublabel: 'Officiels',
    icon: 'music_note',
  },
  'pl-albums-jocha':   {
    band: 'bg-gradient-to-r from-purple-600 to-violet-700',
    logoColor: 'text-purple-200',
    label: 'Albums',
    sublabel: 'Tous les projets',
    icon: 'album',
  },
  'pl-eps-jocha':      {
    band: 'bg-gradient-to-r from-teal-500 to-cyan-700',
    logoColor: 'text-teal-200',
    label: 'EPs',
    sublabel: 'Extended Play',
    icon: 'queue_music',
  },
  'pl-catalogue-jocha':{
    band: 'bg-gradient-to-r from-slate-600 to-slate-800',
    logoColor: 'text-slate-300',
    label: 'Catalogue',
    sublabel: 'Complet',
    icon: 'library_music',
  },
}

export default function SystemPlaylistCover({ playlist, className = '' }: Props) {
  const daily = DAILY_META[playlist.id]
  const catalogue = CATALOGUE_META[playlist.id]

  // 4 premières covers distinctes
  const coverTracks = playlist.trackIds
    .reduce<typeof JOCHA_TRACKS>((acc, id) => {
      const t = JOCHA_TRACKS.find((tr) => tr.id === id)
      if (t && !acc.some((a) => a.albumArt === t.albumArt)) acc.push(t)
      return acc
    }, [])
    .slice(0, 4)

  const bgSrc = playlist.cover ?? coverTracks[0]?.albumArt ?? null

  /* ── Daily Mix — artwork CSS pur ───────────────────────────────── */
  if (daily) {
    return (
      <div
        className={`relative w-full aspect-square overflow-hidden rounded-lg ${className}`}
        style={{ backgroundColor: daily.baseBg }}
      >
        {/* Artwork unique par genre */}
        <DailyArtwork id={playlist.id} />

        {/* Bandeau coloré en bas */}
        <div className={`absolute bottom-0 left-0 right-0 ${daily.band} px-3 py-2.5 flex items-end justify-between`}>
          <div>
            <p className="font-label text-[9px] uppercase tracking-[0.2em] text-white/70 font-bold leading-none mb-0.5">
              Daily Mix
            </p>
            <p className="font-headline font-black text-white text-base leading-none uppercase">
              {daily.label}
            </p>
          </div>
          <span className="font-headline font-black text-white/90 text-2xl leading-none">
            {daily.num}
          </span>
        </div>

        {/* Logo coloré en haut à gauche */}
        <div className="absolute top-2 left-2">
          <LogoOwl size={22} className={`${daily.logoColor} drop-shadow-lg`} />
        </div>
      </div>
    )
  }

  /* ── Playlists catalogue — grille 2×2 + bandeau ─────────────────── */
  if (catalogue) {
    return (
      <div className={`relative w-full aspect-square overflow-hidden rounded-lg bg-surface-container ${className}`}>
        {/* Cover custom OU grille 2×2 auto */}
        {playlist.cover ? (
          <Image src={playlist.cover} alt="" fill className="object-cover" unoptimized />
        ) : coverTracks.length >= 4 ? (
          <div className="grid grid-cols-2 w-full h-full">
            {coverTracks.map((t) => (
              <div key={t.id} className="relative overflow-hidden">
                <Image src={t.albumArt} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        ) : bgSrc ? (
          <Image src={bgSrc} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-surface-container-high" />
        )}

        {/* Overlay dégradé vers le bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Bandeau en bas */}
        <div className={`absolute bottom-0 left-0 right-0 ${catalogue.band} px-3 py-2 flex items-center justify-between`}>
          <div>
            <p className="font-label text-[8px] uppercase tracking-[0.2em] text-white/60 font-bold leading-none mb-0.5">
              {catalogue.sublabel}
            </p>
            <p className="font-headline font-black text-white text-sm leading-none uppercase">
              {catalogue.label}
            </p>
          </div>
          <span
            className="material-symbols-outlined text-white/80 text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {catalogue.icon}
          </span>
        </div>

        {/* Logo coloré en haut à gauche */}
        <div className="absolute top-2 left-2">
          <LogoOwl size={22} className={`${catalogue.logoColor} drop-shadow-lg`} />
        </div>
      </div>
    )
  }

  /* ── Playlist utilisateur ─────────────────────────────────────── */
  return (
    <div className={`relative w-full aspect-square overflow-hidden rounded-lg bg-surface-container ${className}`}>
      {bgSrc ? (
        <Image src={bgSrc} alt={playlist.name} fill className="object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">queue_music</span>
        </div>
      )}
    </div>
  )
}