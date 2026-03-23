'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RELEASES } from '@/data/releases'
import MaterialIcon from '@/components/ui/MaterialIcon'

export default function DiscographyBento() {
  const albums = MOCK_RELEASES.filter((r) => r.type === 'album')
  const eps = MOCK_RELEASES.filter((r) => r.type === 'ep')
  const singles = MOCK_RELEASES.filter((r) => r.type === 'single')

  return (
    <section className="mt-20 px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Albums */}
      <div className="md:col-span-8 bg-surface-container-low p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline text-3xl font-black tracking-tighter">ALBUMS</h3>
          <Link href="/discography" className="text-primary">
            <MaterialIcon name="arrow_forward" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {albums.slice(0, 4).map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.slug}`}
              className="group flex gap-4 items-center cursor-pointer"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-lg overflow-hidden bg-surface-container">
                <Image
                  src={album.coverArt}
                  alt={album.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover object-top"
                  unoptimized
                />
              </div>
              <div>
                <h5 className="font-headline font-bold text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                  {album.title}
                </h5>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mt-1">
                  {album.tracks.length || '12'} Tracks • {album.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* EPs */}
      <div className="md:col-span-4 bg-surface-container p-8 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="font-headline text-3xl font-black tracking-tighter mb-6">EPs</h3>
          <div className="space-y-6">
            {eps.map((ep) => (
              <Link
                key={ep.id}
                href={`/album/${ep.slug}`}
                className="flex justify-between items-center group cursor-pointer"
              >
                <span className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                  {ep.title}
                </span>
                <span className="font-label text-[10px] text-on-surface-variant">{ep.year}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-outline-variant/10">
          <Link
            href="/discography"
            className="block w-full py-3 text-center rounded-full border border-outline-variant/30 font-label text-xs font-bold uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-all"
          >
            Explore Archives
          </Link>
        </div>
      </div>

      {/* Singles */}
      <div className="md:col-span-12 bg-surface-container-high/50 p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-3xl font-black tracking-tighter">SINGLES</h3>
          <Link href="/discography" className="font-label text-xs text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {singles.concat(MOCK_RELEASES.filter((r) => r.type !== 'single')).slice(0, 6).map((item) => (
            <Link
              key={item.id}
              href={`/album/${item.slug}`}
              className="group cursor-pointer"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-surface-container mb-3 relative">
                <Image
                  src={item.coverArt}
                  alt={item.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h5 className="font-headline font-bold text-sm group-hover:text-primary transition-colors truncate">
                {item.title}
              </h5>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                {item.year}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
