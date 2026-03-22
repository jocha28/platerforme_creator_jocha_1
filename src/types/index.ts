export interface Track {
  id: string
  title: string
  artist: string
  albumId: string
  albumTitle: string
  albumArt: string
  audioUrl?: string
  genres?: string[]
  duration: number // seconds
  plays: number
  isFavorite: boolean
  trackNumber?: number
}

export type ReleaseType = 'album' | 'mixtape' | 'ep' | 'single'

export interface Album {
  id: string
  slug: string
  title: string
  artist: string
  year: number
  genre: string
  coverArt: string
  type: ReleaseType
  tracks: Track[]
  totalDuration: number // seconds
  plays: number
  isFeatured: boolean
}

export type TabId = 'latest' | 'albums' | 'mixtapes' | 'eps' | 'singles'

export interface NavItem {
  label: string
  icon: string
  iconFilled: string
  href: string
}
