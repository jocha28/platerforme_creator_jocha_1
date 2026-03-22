import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

const AUDIO_DIR = process.env.AUDIO_DIR ?? join(process.cwd(), 'public', 'music')

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')
  if (cookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!existsSync(AUDIO_DIR)) {
    return NextResponse.json({ files: [], dir: AUDIO_DIR })
  }

  const files = readdirSync(AUDIO_DIR)
    .filter((f) => f.toLowerCase().endsWith('.mp3'))
    .map((name) => {
      const stat = statSync(join(AUDIO_DIR, name))
      return {
        name,
        size: stat.size,
        url: `/api/audio/${encodeURIComponent(name)}`,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ files, dir: AUDIO_DIR, total: files.length })
}
