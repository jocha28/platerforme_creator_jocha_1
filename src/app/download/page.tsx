'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'

const GITHUB_RELEASES = 'https://github.com/jocha28/platerforme_creator_jocha_1/releases/latest'

const PLATFORMS = [
  {
    id: 'windows',
    label: 'Windows',
    icon: 'computer',
    version: 'Windows 10 / 11',
    ext: '.exe',
    description: 'Installateur NSIS — double-clic pour installer',
    color: 'from-blue-500/20 to-blue-600/10',
    badge: 'border-blue-500/40 text-blue-400',
    href: GITHUB_RELEASES,
  },
  {
    id: 'mac',
    label: 'macOS',
    icon: 'laptop_mac',
    version: 'macOS 12+',
    ext: '.dmg',
    description: 'Image disque — glisse l\'app dans Applications',
    color: 'from-slate-500/20 to-slate-600/10',
    badge: 'border-slate-400/40 text-slate-300',
    href: GITHUB_RELEASES,
  },
  {
    id: 'linux',
    label: 'Linux',
    icon: 'terminal',
    version: 'Ubuntu, Debian, Arch…',
    ext: '.AppImage / .deb',
    description: 'AppImage portable ou paquet Debian',
    color: 'from-orange-500/20 to-orange-600/10',
    badge: 'border-orange-500/40 text-orange-400',
    href: GITHUB_RELEASES,
  },
]

const MOBILE = [
  {
    id: 'android',
    label: 'Android',
    icon: 'android',
    steps: [
      'Ouvre jocha-music.fly.dev dans Chrome',
      'Appuie sur les 3 points ⋮ en haut à droite',
      'Sélectionne « Ajouter à l\'écran d\'accueil »',
      'L\'app s\'installe comme une vraie application',
    ],
    color: 'from-green-500/20 to-green-600/10',
    badge: 'border-green-500/40 text-green-400',
  },
  {
    id: 'ios',
    label: 'iPhone / iPad',
    icon: 'phone_iphone',
    steps: [
      'Ouvre jocha-music.fly.dev dans Safari',
      'Appuie sur l\'icône Partage ↑',
      'Sélectionne « Sur l\'écran d\'accueil »',
      'L\'app apparaît comme une app native',
    ],
    color: 'from-slate-400/20 to-slate-500/10',
    badge: 'border-slate-400/40 text-slate-300',
  },
]

export default function DownloadPage() {
  const [detected, setDetected] = useState<string | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/android/.test(ua)) setDetected('android')
    else if (/iphone|ipad/.test(ua)) setDetected('ios')
    else if (/win/.test(ua)) setDetected('windows')
    else if (/mac/.test(ua)) setDetected('mac')
    else if (/linux/.test(ua)) setDetected('linux')
  }, [])

  return (
    <div className="pt-16 pb-40 px-6 md:px-12">
      {/* Header */}
      <div className="mt-10 mb-14 max-w-3xl">
        <p className="font-label text-xs text-primary uppercase tracking-[0.3em] font-bold mb-3">
          Télécharger
        </p>
        <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
          Jocha Official
        </h1>
        <p className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed">
          Installe l&apos;application sur tous tes appareils pour écouter la musique de Jocha
          en plein écran, sans navigateur.
        </p>
      </div>

      {/* Détection automatique */}
      {detected && ['windows', 'mac', 'linux'].includes(detected) && (
        <div className="mb-10 p-5 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-4 max-w-xl">
          <MaterialIcon name="auto_awesome" className="text-primary text-2xl shrink-0" />
          <div>
            <p className="font-headline font-bold text-sm uppercase tracking-wider text-primary">
              Plateforme détectée : {detected === 'windows' ? 'Windows' : detected === 'mac' ? 'macOS' : 'Linux'}
            </p>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Le bouton recommandé est mis en avant ci-dessous
            </p>
          </div>
        </div>
      )}
      {detected && ['android', 'ios'].includes(detected) && (
        <div className="mb-10 p-5 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-4 max-w-xl">
          <MaterialIcon name="auto_awesome" className="text-primary text-2xl shrink-0" />
          <div>
            <p className="font-headline font-bold text-sm uppercase tracking-wider text-primary">
              Mobile détecté — Installation PWA
            </p>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Suis les instructions ci-dessous pour installer l&apos;app directement
            </p>
          </div>
        </div>
      )}

      {/* Desktop */}
      <section className="mb-14">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
          <MaterialIcon name="computer" className="text-primary" />
          Application Bureau
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLATFORMS.map((p) => {
            const isDetected = detected === p.id
            return (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative flex flex-col gap-4 p-6 rounded-2xl border transition-all hover:border-primary/40 hover:-translate-y-0.5 ${
                  isDetected
                    ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-transparent'
                    : 'border-outline-variant/20 bg-surface-container-low'
                }`}
              >
                {isDetected && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-bold">
                    Recommandé
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center border ${p.badge.split(' ')[0]}`}>
                  <MaterialIcon name={p.icon} className={`text-2xl ${p.badge.split(' ')[1]}`} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-tight">
                    {p.label}
                  </h3>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    {p.version}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-outline-variant/10">
                  <span className="font-label text-xs font-bold text-primary uppercase tracking-wider">
                    Télécharger {p.ext}
                  </span>
                  <MaterialIcon name="download" className="text-primary text-sm" />
                </div>
              </a>
            )
          })}
        </div>
        <p className="font-body text-xs text-on-surface-variant mt-4 opacity-60">
          Les builds sont générés automatiquement via GitHub Actions lors de chaque release.
        </p>
      </section>

      {/* Mobile PWA */}
      <section className="mb-14">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
          <MaterialIcon name="smartphone" className="text-primary" />
          Application Mobile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOBILE.map((m) => {
            const isDetected = detected === m.id
            return (
              <div
                key={m.id}
                className={`flex flex-col gap-4 p-6 rounded-2xl border ${
                  isDetected
                    ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-transparent'
                    : 'border-outline-variant/20 bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center border ${m.badge.split(' ')[0]}`}>
                    <MaterialIcon name={m.icon} className={`text-2xl ${m.badge.split(' ')[1]}`} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg uppercase tracking-tight">
                      {m.label}
                    </h3>
                    {isDetected && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-bold mt-0.5">
                        Ton appareil
                      </span>
                    )}
                  </div>
                </div>
                <ol className="space-y-2">
                  {m.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-headline font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="font-body text-sm text-on-surface-variant leading-snug">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-2 p-3 rounded-xl bg-surface-container flex items-center gap-2">
                  <MaterialIcon name="info" className="text-on-surface-variant text-sm shrink-0" />
                  <p className="font-body text-xs text-on-surface-variant">
                    Fonctionne sans passer par un App Store. Mises à jour automatiques.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Avantages PWA */}
      <section className="max-w-3xl">
        <div className="p-8 rounded-2xl border border-outline-variant/20 bg-surface-container-low">
          <h3 className="font-headline text-xl font-black uppercase tracking-tighter mb-6">
            Pourquoi installer l&apos;application ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: 'fullscreen', label: 'Plein écran', desc: 'Sans barre de navigation du navigateur' },
              { icon: 'notifications', label: 'Notifications', desc: 'Nouvelles sorties et mises à jour' },
              { icon: 'speed', label: 'Plus rapide', desc: 'Chargement instantané au lancement' },
              { icon: 'update', label: 'Auto-update', desc: 'Toujours la dernière version' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MaterialIcon name={f.icon} className="text-primary text-lg" />
                </div>
                <div>
                  <p className="font-headline font-bold text-sm uppercase tracking-wide">{f.label}</p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
