import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
  
  // 1. Update total counts
  const counts = readStore<Record<string, number>>('play-counts.json', {})
  counts[trackId] = (counts[trackId] ?? 0) + 1
  writeStore('play-counts.json', counts)

  // 2. Update history with timestamps
  const history = readStore<{ trackId: string, timestamp: number }[]>('play-history.json', [])
  history.push({ trackId, timestamp: Date.now() })
  
  // Keep only the last 1000 entries to avoid file bloat
  const limitedHistory = history.slice(-1000)
  writeStore('play-history.json', limitedHistory)

  return NextResponse.json({ trackId, count: counts[trackId] })
}
