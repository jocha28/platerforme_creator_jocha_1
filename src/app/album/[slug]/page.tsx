import { notFound } from 'next/navigation'
import { MOCK_ALBUMS } from '@/data/albums'
import { MOCK_RELEASES } from '@/data/releases'
import AlbumPageClient from './AlbumPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const albumSlugs = Object.keys(MOCK_ALBUMS).map((slug) => ({ slug }))
  const releaseSlugs = MOCK_RELEASES.map((r) => ({ slug: r.slug }))
  // Dédoublonner
  const seen = new Set(albumSlugs.map((s) => s.slug))
  const extra = releaseSlugs.filter((s) => !seen.has(s.slug))
  return [...albumSlugs, ...extra]
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params
  const album = MOCK_ALBUMS[slug]

  if (!album) {
    // Essaie de trouver dans les releases (sans tracklist complète)
    const release = MOCK_RELEASES.find((r) => r.slug === slug)
    if (!release) notFound()
    return <AlbumPageClient album={release} />
  }

  return <AlbumPageClient album={album} />
}
