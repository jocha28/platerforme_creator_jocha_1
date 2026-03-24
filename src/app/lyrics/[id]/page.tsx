'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { JOCHA_TRACKS } from '@/data/tracks'
import { getLyrics } from '@/data/lyrics'
import { getLyricsMeta } from '@/data/lyrics-meta'
import { usePlayer } from '@/context/PlayerContext'
import { useArtist } from '@/context/ArtistContext'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

type Tab = 'lyrics' | 'artist' | 'data'

export default function LyricsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentTime, seek, currentTrack } = usePlayer()
  const { profile } = useArtist()
  const [activeTab, setActiveTab] = useState<Tab>('lyrics')

  const track = JOCHA_TRACKS.find((t) => t.id === id)
  const lyrics = track ? getLyrics(track.id) : null
  const meta = track ? getLyricsMeta(track.id) : null

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        <p className="font-label uppercase tracking-widest text-sm">Titre introuvable</p>
      </div>
    )
  }

  // Lignes non vides pour l'affichage éditorial
  const lines = lyrics?.filter((l) => l.text !== '') ?? []

  // Grouper par blocs de 2-3 lignes pour alterner style
  const blocks: typeof lines[] = []
  let i = 0
  while (i < lines.length) {
    blocks.push(lines.slice(i, i + (i % 5 === 0 ? 2 : 3)))
    i += i % 5 === 0 ? 2 : 3
  }

  return (
    <div className="dark bg-background text-on-surface font-body min-h-screen overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-[60] bg-background/80 backdrop-blur-2xl flex items-center justify-between px-6 h-16 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="active:scale-95 duration-200 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline tracking-tight font-bold text-sm uppercase text-primary/80">
            OWL RECORDS
          </h1>
        </div>
        <Link
          href="/now-playing"
          className="active:scale-95 duration-200 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">headphones</span>
        </Link>
      </header>

      {/* Content */}
      <main className="pt-24 pb-40 px-6 max-w-2xl mx-auto">

        {/* Hero */}
        <section className="mb-16 relative">
          <div className="absolute -left-6 top-2 w-[2px] h-24 bg-gradient-to-b from-primary via-secondary to-transparent" />
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-extrabold mb-4">
            Paroles
          </p>
          <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8">
            {track.title.split(' ').slice(0, 2).join(' ')}
            <br />
            <span className="text-primary italic font-light">
              {track.title.split(' ').slice(2).join(' ') || track.title}
            </span>
          </h2>
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/profile')}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative w-12 h-12 rounded-full bg-surface-container overflow-hidden ring-1 ring-white/10">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="font-headline text-base font-bold text-on-surface tracking-tight leading-none mb-1">
                {profile.name}
              </p>
              <p className="font-label text-xs text-on-surface-variant font-medium">
                {track.albumTitle}
              </p>
            </div>
          </div>
        </section>

        {/* Tabs content */}
        {activeTab === 'lyrics' && (
          <article className="space-y-12 mb-20">
            {!lyrics ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">lyrics</span>
                <p className="font-label text-sm text-on-surface-variant/50 uppercase tracking-widest">
                  Paroles non disponibles pour ce titre
                </p>
              </div>
            ) : (
              blocks.map((block, bIdx) => {
                const annotation = meta?.annotations?.find(
                  (a) => block.some((l) => lyrics.indexOf(l) === a.lineIndex || lyrics.filter(x => x.text !== '').indexOf(l) === a.lineIndex)
                )
                const isFirst = bIdx === 0
                const isHighlight = bIdx % 3 === 1

                return (
                  <div key={bIdx} className={cn('space-y-4', !isHighlight && bIdx !== 0 && 'opacity-60 hover:opacity-100 transition-opacity duration-500')}>
                    {isHighlight ? (
                      <div className="relative group">
                        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
                        {block.map((line, lIdx) => (
                          <p
                            key={lIdx}
                            onClick={() => seek(line.time)}
                            className={cn(
                              'font-headline text-3xl font-bold tracking-tight text-white leading-tight cursor-pointer hover:text-primary transition-colors',
                              lIdx > 0 && 'mt-2'
                            )}
                          >
                            {line.text}
                          </p>
                        ))}

                        {/* Creator Commentary */}
                        {annotation && (
                          <div className="mt-8 rounded-2xl p-6 relative overflow-hidden border border-primary/10 bg-surface-container/40 backdrop-blur-sm">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  auto_awesome
                                </span>
                              </div>
                              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-black">
                                Commentaire de l&apos;artiste
                              </p>
                            </div>
                            <p className="font-headline text-lg italic font-normal leading-relaxed text-on-surface/90">
                              &ldquo;{annotation.comment}&rdquo;
                            </p>
                            {annotation.year && (
                              <div className="mt-6 flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                                  Recorded {annotation.year}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      block.map((line, lIdx) => (
                        <p
                          key={lIdx}
                          onClick={() => seek(line.time)}
                          className="font-headline text-3xl font-light tracking-tight leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {line.text}
                        </p>
                      ))
                    )}
                  </div>
                )
              })
            )}
          </article>
        )}

        {activeTab === 'artist' && (
          <section className="mb-20 space-y-8">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden">
              {profile.coverPhoto ? (
                <Image src={profile.coverPhoto} alt={profile.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-extrabold mb-2">Artiste</p>
                <h3 className="font-headline text-4xl font-black tracking-tighter">{profile.name}</h3>
              </div>
            </div>
            <p className="font-body text-base text-on-surface-variant leading-relaxed">
              {profile.bio || 'Biographie non disponible.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.genres?.map((g) => (
                <span key={g} className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 font-label text-xs uppercase tracking-wider text-on-surface-variant">
                  {g}
                </span>
              ))}
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-widest font-bold hover:gap-3 transition-all"
            >
              Voir le profil complet
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </section>
        )}

        {activeTab === 'data' && (
          <section className="mb-20">
            <div className="bg-surface-container/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-black mb-2 tracking-tighter">
                    {meta?.theme ?? 'Analyse'}
                  </h3>
                  <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-black">
                    {meta?.themeLabel ?? 'Thème narratif'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary">hub</span>
                </div>
              </div>

              <p className="font-body text-base text-on-surface-variant leading-relaxed mb-10 font-medium">
                {meta?.description ?? 'Analyse non disponible pour ce titre.'}
              </p>

              {/* Technical data */}
              {(meta?.bpm || meta?.key) && (
                <div className="grid grid-cols-2 gap-6">
                  {meta.bpm && (
                    <div className="relative p-6 rounded-3xl bg-black/20 border border-white/5 overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <span className="material-symbols-outlined text-4xl">speed</span>
                      </div>
                      <p className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">
                        Tempo
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-headline text-4xl font-black text-primary">{meta.bpm}</p>
                        <span className="text-[10px] font-bold text-on-surface-variant">BPM</span>
                      </div>
                      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(100, (meta.bpm / 200) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {meta.key && (
                    <div className="relative p-6 rounded-3xl bg-black/20 border border-white/5 overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <span className="material-symbols-outlined text-4xl">music_note</span>
                      </div>
                      <p className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">
                        Tonalité
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-headline text-4xl font-black text-secondary">{meta.key}</p>
                        {meta.mode && (
                          <span className="text-[10px] font-bold text-secondary/60">{meta.mode}</span>
                        )}
                      </div>
                      <div className="mt-4 flex gap-1">
                        <div className="h-1 flex-1 bg-secondary/40 rounded-full" />
                        <div className="h-1 flex-1 bg-white/5 rounded-full" />
                        <div className="h-1 flex-1 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Genres */}
              <div className="mt-8">
                <p className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {track.genres.map((g) => (
                    <span key={g} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-label text-[10px] uppercase tracking-wider text-primary">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Tab Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-[70] px-6 pb-10 pt-4">
        <div className="max-w-2xl mx-auto bg-surface-container-low/80 backdrop-blur-2xl border border-white/10 rounded-full flex justify-around items-center h-20 px-4 shadow-2xl">

          <Link href="/" className="flex flex-col items-center justify-center text-on-surface/40 hover:text-primary transition-all duration-300">
            <span className="material-symbols-outlined mb-1 text-2xl">grid_view</span>
            <span className="font-label text-[8px] uppercase tracking-widest font-bold">Menu</span>
          </Link>

          <div className="h-10 w-[1px] bg-white/5" />

          <button
            onClick={() => setActiveTab('lyrics')}
            className={cn('flex flex-col items-center justify-center relative transition-all duration-300', activeTab === 'lyrics' ? 'text-primary' : 'text-on-surface/40 hover:text-primary')}
          >
            {activeTab === 'lyrics' && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />}
            <span
              className="material-symbols-outlined mb-1 text-2xl"
              style={activeTab === 'lyrics' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              auto_stories
            </span>
            <span className={cn('font-label text-[8px] uppercase tracking-widest', activeTab === 'lyrics' ? 'font-black' : 'font-bold')}>
              Paroles
            </span>
          </button>

          <button
            onClick={() => setActiveTab('artist')}
            className={cn('flex flex-col items-center justify-center relative transition-all duration-300', activeTab === 'artist' ? 'text-primary' : 'text-on-surface/40 hover:text-primary')}
          >
            {activeTab === 'artist' && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />}
            <span
              className="material-symbols-outlined mb-1 text-2xl"
              style={activeTab === 'artist' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              face_retouching_natural
            </span>
            <span className={cn('font-label text-[8px] uppercase tracking-widest', activeTab === 'artist' ? 'font-black' : 'font-bold')}>
              Artiste
            </span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={cn('flex flex-col items-center justify-center relative transition-all duration-300', activeTab === 'data' ? 'text-primary' : 'text-on-surface/40 hover:text-primary')}
          >
            {activeTab === 'data' && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />}
            <span
              className="material-symbols-outlined mb-1 text-2xl"
              style={activeTab === 'data' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              analytics
            </span>
            <span className={cn('font-label text-[8px] uppercase tracking-widest', activeTab === 'data' ? 'font-black' : 'font-bold')}>
              Données
            </span>
          </button>

        </div>
      </nav>
    </div>
  )
}
