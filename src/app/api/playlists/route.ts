import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'
import { Playlist } from '@/types'
import { JOCHA_TRACKS } from '@/data/tracks'
import { MOCK_RELEASES } from '@/data/releases'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Shuffle déterministe (seed = jour courant) ───────────────────────────────
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed >>> 0
  for (let i = result.length - 1; i > 0; i--) {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17; s >>>= 0
    s ^= s << 5;  s >>>= 0
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const SYSTEM_IDS = new Set([
  'pl-singles-jocha',
  'pl-albums-jocha',
  'pl-eps-jocha',
  'pl-catalogue-jocha',
  'pl-daily-drill',
  'pl-daily-trap',
  'pl-daily-conscious',
  'pl-daily-french',
  'pl-daily-cloud',
])

// ─── Construction des playlists système ──────────────────────────────────────
function buildSystemPlaylists(): Playlist[] {
  const daySeed = Math.floor(Date.now() / 86_400_000)

  // 1. Singles
  const singleTracks = JOCHA_TRACKS.filter((t) => t.albumId === 'singles')
  const singlesPlaylist: Playlist = {
    id: 'pl-singles-jocha',
    name: 'Singles de Jocha',
    description: `${singleTracks.length} singles officiels`,
    cover: singleTracks[0]?.albumArt,
    trackIds: singleTracks.map((t) => t.id),
    createdAt: 0,
  }

  // 2. Albums
  const albumIds = new Set(MOCK_RELEASES.filter((r) => r.type === 'album').map((r) => r.id))
  const albumTracks = JOCHA_TRACKS.filter((t) => albumIds.has(t.albumId))
  const albumsPlaylist: Playlist = {
    id: 'pl-albums-jocha',
    name: 'Tous les albums',
    description: `${albumTracks.length} titres · ${albumIds.size} albums`,
    cover: MOCK_RELEASES.find((r) => r.type === 'album' && r.isFeatured)?.coverArt
      ?? MOCK_RELEASES.find((r) => r.type === 'album')?.coverArt,
    trackIds: albumTracks.map((t) => t.id),
    createdAt: 0,
  }

  // 3. EPs
  const epIds = new Set(MOCK_RELEASES.filter((r) => r.type === 'ep').map((r) => r.id))
  const epTracks = JOCHA_TRACKS.filter((t) => epIds.has(t.albumId))
  const epsPlaylist: Playlist = {
    id: 'pl-eps-jocha',
    name: 'Tous les EPs',
    description: `${epTracks.length} titres · ${epIds.size} EPs`,
    cover: MOCK_RELEASES.find((r) => r.type === 'ep')?.coverArt,
    trackIds: epTracks.map((t) => t.id),
    createdAt: 0,
  }

  // 4. Catalogue complet (albums + EPs + mixtapes — tout sauf singles)
  const catalogueTracks = JOCHA_TRACKS.filter((t) => t.albumId !== 'singles')
  const cataloguePlaylist: Playlist = {
    id: 'pl-catalogue-jocha',
    name: 'Catalogue complet',
    description: `${catalogueTracks.length} titres · albums, EPs & mixtapes`,
    cover: MOCK_RELEASES.find((r) => r.isFeatured)?.coverArt,
    trackIds: catalogueTracks.map((t) => t.id),
    createdAt: 0,
  }

  // 5. Daily Mixes par genre (20 titres, shufflés chaque jour)
  const GENRE_MIXES: { id: string; name: string; keywords: string[]; cover: string }[] = [
    {
      id: 'pl-daily-drill',
      name: 'Daily Mix · Drill',
      keywords: ['drill', 'uk drill'],
      cover: MOCK_RELEASES.find((r) => r.id === 'bug-royal')?.coverArt ?? '',
    },
    {
      id: 'pl-daily-trap',
      name: 'Daily Mix · Trap',
      keywords: ['trap', 'dark trap'],
      cover: MOCK_RELEASES.find((r) => r.id === 'cas-isole')?.coverArt ?? '',
    },
    {
      id: 'pl-daily-conscious',
      name: 'Daily Mix · Conscious',
      keywords: ['conscious hip hop', 'conscious'],
      cover: MOCK_RELEASES.find((r) => r.id === 'ether-et-bitume')?.coverArt ?? '',
    },
    {
      id: 'pl-daily-french',
      name: 'Daily Mix · French Rap',
      keywords: ['french rap', 'rap français', 'french hip hop'],
      cover: MOCK_RELEASES.find((r) => r.id === 'jeune-vieux')?.coverArt ?? '',
    },
    {
      id: 'pl-daily-cloud',
      name: 'Daily Mix · Cloud Rap',
      keywords: ['cloud rap', 'emo rap'],
      cover: MOCK_RELEASES.find((r) => r.id === 'vibe-solo')?.coverArt ?? '',
    },
  ]

  const dailyMixes: Playlist[] = GENRE_MIXES.map((mix, i) => {
    const matching = JOCHA_TRACKS.filter((t) =>
      t.genres?.some((g: string) => mix.keywords.includes(g))
    )
    const shuffled = seededShuffle(matching, daySeed + i)
    return {
      id: mix.id,
      name: mix.name,
      description: `Mis à jour chaque jour · ${mix.keywords[0]}`,
      cover: mix.cover,
      trackIds: shuffled.slice(0, 20).map((t) => t.id),
      createdAt: 0,
    }
  })

  return [singlesPlaylist, albumsPlaylist, epsPlaylist, cataloguePlaylist, ...dailyMixes]
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export function getPlaylists(): Playlist[] {
  const stored = readStore<Playlist[]>('playlists.json', [])
  // Overrides custom (cover, name, description) sauvegardés pour les playlists système
  const systemOverrides = new Map(
    stored.filter((p) => SYSTEM_IDS.has(p.id)).map((p) => [p.id, p])
  )
  const userPlaylists = stored.filter((p) => !SYSTEM_IDS.has(p.id))

  const systemPlaylists = buildSystemPlaylists().map((p) => {
    const override = systemOverrides.get(p.id)
    if (!override) return p
    return {
      ...p,
      cover:       override.cover       ?? p.cover,
      name:        override.name        ?? p.name,
      description: override.description ?? p.description,
    }
  })

  return [...systemPlaylists, ...userPlaylists]
}

export function GET() {
  return NextResponse.json(getPlaylists(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name requis' }, { status: 400 })
  const stored = readStore<Playlist[]>('playlists.json', [])
  const userPlaylists = stored.filter((p) => !SYSTEM_IDS.has(p.id))
  const newPlaylist: Playlist = {
    id: `pl-${Date.now()}`,
    name,
    trackIds: [],
    createdAt: Date.now(),
  }
  const next = [...userPlaylists, newPlaylist]
  writeStore('playlists.json', next)
  return NextResponse.json(newPlaylist, { status: 201 })
}