import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'

export const runtime = 'nodejs'

export function GET() {
  const counts = readStore<Record<string, number>>('play-counts.json', {})
  return NextResponse.json(counts, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  const { trackId } = await req.json()
  if (!trackId || typeof trackId !== 'string') {
    return NextResponse.json({ error: 'trackId requis' }, { status: 400 })
  }
  const counts = readStore<Record<string, number>>('play-counts.json', {})
  counts[trackId] = (counts[trackId] ?? 0) + 1
  writeStore('play-counts.json', counts)
  return NextResponse.json({ trackId, count: counts[trackId] })
}
