'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Album } from '@/types'
import MaterialIcon from '@/components/ui/MaterialIcon'
import Badge from '@/components/ui/Badge'

interface ReleaseCardProps {
  album: Album
  variant?: 'featured' | 'square' | 'small'
  priority?: boolean
}

export default function ReleaseCard({ album, variant = 'square', priority = false }: ReleaseCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/album/${album.slug}`} className="block group cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-surface-container-high rounded-lg mb-6">
          <Image
            src={album.coverArt}
            alt={album.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-8 left-8">
            <Badge label="Newest Drop" className="mb-4" />
            <h3 className="font-headline text-4xl font-black text-on-background tracking-tight">
              {album.title}
            </h3>
            <p className="font-label text-sm text-on-surface-variant/80 tracking-widest uppercase mt-1">
              {album.year} • {album.type.toUpperCase()}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'small') {
    return (
      <Link href={`/album/${album.slug}`} className="block group cursor-pointer">
        <div className="aspect-square overflow-hidden bg-surface-container-high rounded-lg mb-4 relative">
          <Image
            src={album.coverArt}
            alt={album.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            unoptimized
          />
        </div>
        <h4 className="font-headline text-lg font-bold text-on-background group-hover:text-primary transition-colors">
          {album.title}
        </h4>
        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
          {album.year} • {album.type}
        </p>
      </Link>
    )
  }

  return (
    <Link href={`/album/${album.slug}`} className="block group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-surface-container-high rounded-lg mb-6">
        <Image
          src={album.coverArt}
          alt={album.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-6 left-6">
          <h3 className="font-headline text-2xl font-black text-on-background tracking-tight">
            {album.title}
          </h3>
          <p className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">
            {album.year} • {album.type.toUpperCase()}
          </p>
        </div>
      </div>
    </Link>
  )
}
