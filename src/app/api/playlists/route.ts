import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'
import { Playlist } from '@/types'
import { JOCHA_TRACKS } from '@/data/tracks'

export const runtime = 'nodejs'

const SINGLE_IDS = JOCHA_TRACKS.filter((t) => t.albumId === 'singles').map((t) => t.id)

const DEFAULT_SINGLES_PLAYLIST: Playlist = {
  id: 'pl-singles-jocha',
  name: 'Singles de Jocha',
  description: `${SINGLE_IDS.length} singles officiels`,
  cover: JOCHA_TRACKS.find((t) => t.albumId === 'singles')?.albumArt,
  trackIds: SINGLE_IDS,
  createdAt: 0,
}

function getPlaylists(): Playlist[] {
  const stored = readStore<Playlist[]>('playlists.json', [])
  const hasSingles = stored.some((p) => p.id === DEFAULT_SINGLES_PLAYLIST.id)
  if (hasSingles) {
    return stored.map((p) =>
      p.id === DEFAULT_SINGLES_PLAYLIST.id
        ? { ...p, trackIds: SINGLE_IDS, description: DEFAULT_SINGLES_PLAYLIST.description }
        : p
    )
  }
  return [DEFAULT_SINGLES_PLAYLIST, ...stored]
}

export function GET() {
  const playlists = getPlaylists()
  writeStore('playlists.json', playlists)
  return NextResponse.json(playlists, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name requis' }, { status: 400 })
  const playlists = getPlaylists()
  const newPlaylist: Playlist = {
    id: `pl-${Date.now()}`,
    name,
    trackIds: [],
    createdAt: Date.now(),
  }
  const next = [...playlists, newPlaylist]
  writeStore('playlists.json', next)
  return NextResponse.json(newPlaylist, { status: 201 })
}
