export interface TrendingItem {
  id: string
  title: string
  artist: string
  type: string
  year: number
  coverArt: string
  slug: string
}

export const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'tr-prod-empire-2026',
    title: 'PROD EMPIRE 2026',
    artist: 'Jocha',
    type: 'Album',
    year: 2026,
    slug: 'prod-empire-jocha-2026',
    coverArt: '/api/covers/prod-empire-jocha-2026.jpg',
  },
  {
    id: 'tr-hors-prod',
    title: 'HORS PROD',
    artist: 'Jocha',
    type: 'Album',
    year: 2026,
    slug: 'hors-prod',
    coverArt: '/api/covers/hors-prod.png',
  },
  {
    id: 'tr-bug-systeme',
    title: 'BUG DANS LE SYSTÈME',
    artist: 'Jocha',
    type: 'Track',
    year: 2026,
    slug: 'hors-prod',
    coverArt: '/api/covers/hors-prod.png',
  },
  {
    id: 'tr-code-noir',
    title: 'CODE NOIR (ERROR 404)',
    artist: 'Jocha',
    type: 'Track',
    year: 2026,
    slug: 'hors-prod',
    coverArt: '/api/covers/hors-prod.png',
  },
  {
    id: 'tr-coeur-encrypt',
    title: 'CŒUR ENCRYPTÉ',
    artist: 'Jocha',
    type: 'Track',
    year: 2026,
    slug: 'hors-prod',
    coverArt: '/api/covers/hors-prod.png',
  },
]
