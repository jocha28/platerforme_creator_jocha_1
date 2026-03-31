import { NextRequest, NextResponse } from 'next/server'
import { writeStore } from '@/lib/server-store'
import { Playlist } from '@/types'
import { getPlaylists } from '@/app/api/playlists/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const patch: Partial<Pick<Playlist, 'name' | 'cover' | 'description' | 'trackIds'>> = await req.json()
  const playlists = getPlaylists()
  const next = playlists.map((p) => (p.id === id ? { ...p, ...patch } : p))
  writeStore('playlists.json', next)
  const updated = next.find((p) => p.id === id)
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
