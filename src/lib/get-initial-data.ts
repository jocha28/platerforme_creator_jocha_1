import { readStore } from './server-store'
import { JOCHA_TRACKS } from '@/data/tracks'
import { getPlaylists } from '@/app/api/playlists/route'
import { ArtistProfile } from '@/types'

const DEFAULT_PROFILE: ArtistProfile = {
  name: 'Jocha',
  coverPhoto: '',
  avatar: '',
  bio: "Jocha est un rappeur français...",
  genres: ['Conscious Hip-Hop', 'French Rap', 'Cloud Rap', 'Drill'],
  location: 'France',
  website: '',
  yearsActive: '2025',
}

export function getInitialDataServer() {
  const playCounts = readStore<Record<string, number>>('play-counts.json', {})
  const history = readStore<{ trackId: string, timestamp: number }[]>('play-history.json', [])
  
  // Récemment joués : les 20 derniers IDs uniques
  const recentTrackIds = Array.from(new Set(history.map(h => h.trackId).reverse())).slice(0, 20)
  
  // Top de la semaine
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weeklyPlays = history.filter(h => h.timestamp > oneWeekAgo)
  
  const weeklyCounts: Record<string, number> = {}
  weeklyPlays.forEach(h => {
    weeklyCounts[h.trackId] = (weeklyCounts[h.trackId] ?? 0) + 1
  })
  const weeklyTopTrackIds = Object.entries(weeklyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tid]) => tid)

  const weeklyReleaseCounts: Record<string, number> = {}
  weeklyPlays.forEach(h => {
    const track = JOCHA_TRACKS.find(t => t.id === h.trackId)
    if (track) {
      const rid = track.albumId === 'singles' ? track.id : track.albumId
      weeklyReleaseCounts[rid] = (weeklyReleaseCounts[rid] ?? 0) + 1
    }
  })
  const weeklyTopReleaseIds = Object.entries(weeklyReleaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([rid]) => rid)

  const profile = readStore<ArtistProfile>('profile.json', DEFAULT_PROFILE)
  const playlists = getPlaylists()

  return { 
    playCounts, 
    profile, 
    playlists,
    recentTrackIds,
    weeklyTopTrackIds,
    weeklyTopReleaseIds
  }
}
