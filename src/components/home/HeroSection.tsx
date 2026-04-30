'use client'

import Image from 'next/image'
import Link from 'next/link'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { usePlayer } from '@/context/PlayerContext'
import { MOCK_RELEASES } from '@/data/releases'
import { JOCHA_TRACKS } from '@/data/tracks'

const featured = MOCK_RELEASES[0]

export default function HeroSection() {
  const { play } = usePlayer()

  const tracks = JOCHA_TRACKS
    .filter((t) => featured.type === 'single' ? t.id === featured.id : t.albumId === featured.id)
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))

  function handlePlay() {
    if (tracks.length > 0) play(tracks[0], tracks)
  }

  return (
    <section className="relative overflow-hidden bg-[#0F0D0A]">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      {/* ════════════════════════════════
          MOBILE (< lg)
      ════════════════════════════════ */}
      <div className="lg:hidden flex flex-col relative z-10">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src={featured.coverArt}
            alt={featured.title}
            fill
            className="object-cover scale-105"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0F0D0A]" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded-full font-label text-[9px] uppercase tracking-[0.2em] font-black shadow-lg">
              Featured
            </span>
            <div className="flex flex-col items-end gap-1">
              <span className="font-label text-[10px] text-white/80 uppercase tracking-widest font-bold drop-shadow-md">
                {featured.year}
              </span>
              <span className="w-8 h-0.5 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        <div className="px-8 -mt-24 pb-12 relative z-20">
          <p className="font-label text-[10px] text-primary uppercase tracking-[0.4em] font-black mb-2 drop-shadow-lg">
            {featured.genre}
          </p>
          <h1 className="font-headline font-black uppercase tracking-tighter text-white leading-[0.8] mb-6 drop-shadow-2xl"
            style={{ fontSize: 'clamp(3.5rem, 15vw, 5rem)' }}>
            {featured.title}
          </h1>

          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl font-headline font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-2xl"
            >
              <MaterialIcon name="play_arrow" filled className="text-xl" />
              Play Now
            </button>
            <Link
              href={`/album/${featured.slug}`}
              className="w-16 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"
            >
              <MaterialIcon name="arrow_outward" />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          DESKTOP (≥ lg)
      ════════════════════════════════ */}
      <div className="hidden lg:flex flex-row min-h-[85vh] relative z-10">
        <div className="relative flex-1 flex flex-col justify-center px-16 xl:px-24 py-20">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="h-[1px] w-12 bg-primary/40" />
              <span className="font-label text-[11px] text-primary uppercase tracking-[0.5em] font-black">
                Artist Spotlight
              </span>
            </div>

            <div className="relative">
              <h1
                className="font-headline font-black uppercase tracking-tighter text-white leading-[0.8] mb-2"
                style={{ fontSize: 'clamp(5rem, 10vw, 9rem)' }}
              >
                {featured.title}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="font-label text-xs text-white/40 uppercase tracking-[0.3em] font-bold">
                  {featured.type}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="font-label text-xs text-white/40 uppercase tracking-[0.3em] font-bold">
                  {featured.year}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="font-label text-xs text-primary uppercase tracking-[0.3em] font-bold">
                  Jocha
                </span>
              </div>
            </div>

            <p className="font-body text-white/50 text-lg leading-relaxed max-w-lg mb-8">
              Découvrez l'univers brut de {featured.title}, une fusion entre codes binaires et flows tranchants.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handlePlay}
                className="group relative flex items-center gap-4 px-10 py-5 bg-primary text-on-primary rounded-full font-headline font-black uppercase tracking-widest text-xs hover:pr-12 transition-all shadow-2xl shadow-primary/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <MaterialIcon name="play_arrow" filled className="text-xl relative z-10" />
                <span className="relative z-10">Écouter le projet</span>
              </button>
              
              <Link
                href={`/album/${featured.slug}`}
                className="flex items-center gap-4 px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-headline font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Explorer
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>

          {/* Quick Tracklist */}
          {tracks.length > 0 && (
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-1 max-w-xl">
              {tracks.slice(0, 4).map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => play(t, tracks)}
                  className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all group text-left border border-transparent hover:border-white/5"
                >
                  <span className="font-label text-[10px] text-white/20 w-4 font-black">0{i + 1}</span>
                  <span className="font-headline font-bold text-xs text-white group-hover:text-primary transition-colors flex-1 truncate">
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[45%] xl:w-[50%] relative">
          {/* Cover with Deep Effects */}
          <div className="absolute inset-0 z-10 shadow-[inset_100px_0_150px_-50px_#0F0D0A]" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0F0D0A] to-transparent z-20" />
          
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={featured.coverArt}
              alt={featured.title}
              fill
              className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[3s] ease-out"
              unoptimized
              priority
            />
          </div>

          {/* Floating Element over cover */}
          <div className="absolute bottom-20 left-0 z-30 -translate-x-1/2 hidden xl:block">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary animate-bounce">
                  <MaterialIcon name="star" filled />
                </div>
                <div>
                  <p className="font-label text-[10px] text-white/40 uppercase tracking-widest font-black">Top Release</p>
                  <p className="font-headline text-white font-bold">{featured.genre}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}