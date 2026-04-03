import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'
import { Playlist } from '@/types'
import { getPlaylists } from '@/app/api/playlists/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_IDS = new Set([
  'pl-singles-jocha', 'pl-albums-jocha', 'pl-eps-jocha', 'pl-catalogue-jocha',
  'pl-daily-drill', 'pl-daily-trap', 'pl-daily-conscious', 'pl-daily-french', 'pl-daily-cloud',
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description' | 'trackIds'>> = await req.json()

  const stored = readStore<Playlist[]>('playlists.json', [])

  if (SYSTEM_IDS.has(id)) {
    // Pour les playlists système : ne sauvegarder que les overrides (cover/name/description)
    const existing = stored.find((p) => p.id === id) ?? { id, name: '', trackIds: [], createdAt: 0 }
    const override = { ...existing, ...patch, id, trackIds: existing.trackIds, createdAt: existing.createdAt }
    const next = stored.some((p) => p.id === id)
      ? stored.map((p) => (p.id === id ? override : p))
      : [...stored, override]
    writeStore('playlists.json', next)
  } else {
    // Pour les playlists utilisateur : mise à jour normale
    const next = stored.map((p) => (p.id === id ? { ...p, ...patch } : p))
    writeStore('playlists.json', next)
  }

  const updated = getPlaylists().find((p) => p.id === id)
  if (!updated) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const playlists = getPlaylists()
  const next = playlists.filter((p) => p.id !== id)
  writeStore('playlists.json', next)
  return NextResponse.json({ ok: true })
}
