import { NextResponse } from 'next/server'
import { readStore } from '@/lib/server-store'
import { ArtistProfile } from '@/types'
import { getPlaylists } from '@/app/api/playlists/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_PROFILE: ArtistProfile = {
  name: 'Jocha',
  coverPhoto: '',
  avatar: '',
  bio: "Jocha est un rappeur français de la génération 2020s, dont l'univers sonore se situe au carrefour du conscious hip-hop, du drill et du cloud rap. Artiste inclassable, il a bâti une discographie dense et cohérente autour d'une identité forte : celle d'un développeur qui rappe, ou d'un rappeur qui code.\n\nDepuis ses débuts, Jocha impose un style reconnaissable — des flows tranchants sur des productions sombres, des textes qui parlent en termes de commits, de bugs, de logs et de serveurs, mais pour raconter des histoires profondément humaines : l'ambition, la résistance, la solitude numérique, la quête de sens.\n\n« J'fais du code propre, mental sale / J'rap comme un log d'erreur brutal. »\n\nSa discographie compte 134 titres répartis entre 97 singles, deux albums (Bug Royal, Cas Isolé) et un EP (Jeune Vieux), tous sortis entre 2025 et 2026. Chaque projet est une couche supplémentaire d'un même projet artistique — construire une œuvre qui fait du sens là où d'autres chassent les views et la hype.\n\nSes influences vont de Kendrick Lamar au rap français le plus consciencieux, tout en développant un langage propre — celui d'une génération qui pense en binaire et ressent en storm.",
  genres: ['Conscious Hip-Hop', 'French Rap', 'Cloud Rap', 'Drill', 'Dark Trap', 'Trap', 'Emo Rap', 'Underground Rap'],
  location: 'France',
  website: '',
  yearsActive: '2025',
}

export function GET() {
  const playCounts = readStore<Record<string, number>>('play-counts.json', {})
  const history = readStore<{ trackId: string, timestamp: number }[]>('play-history.json', [])
  
  // Récemment joués : les 20 derniers IDs uniques
  const recentTrackIds = Array.from(new Set(history.map(h => h.trackId).reverse())).slice(0, 20)
  
  // Top de la semaine : écoutes des 7 derniers jours
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

  const profile    = readStore<ArtistProfile>('profile.json', DEFAULT_PROFILE)
  const playlists  = getPlaylists()

  return NextResponse.json(
    { 
      playCounts, 
      profile, 
      playlists,
      recentTrackIds,
      weeklyTopTrackIds
    },
    { headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30' } }
  )
}