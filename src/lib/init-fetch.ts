import { ArtistProfile, Playlist } from '@/types'

export interface InitData {
  playCounts: Record<string, number>
  profile: ArtistProfile
  playlists: Playlist[]
}

// Promise partagée — un seul appel HTTP pour toute l'app
let promise: Promise<InitData> | null = null

export function getInitData(): Promise<InitData> {
  if (!promise) {
    promise = fetch('/api/init')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data ?? { playCounts: {}, profile: null, playlists: [] })
      .catch(() => ({ playCounts: {}, profile: null, playlists: [] }))
  }
  return promise
}

/** Invalider le cache (après une mutation) */
export function invalidateInitCache() {
  promise = null
}