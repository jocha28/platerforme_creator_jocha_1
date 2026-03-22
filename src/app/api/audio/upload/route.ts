import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

const AUDIO_DIR = process.env.AUDIO_DIR ?? join(process.cwd(), 'public', 'music')

export async function POST(req: NextRequest) {
  // Vérifier l'authentification admin
  const cookie = req.cookies.get('admin_session')
  if (cookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    if (!existsSync(AUDIO_DIR)) {
      await mkdir(AUDIO_DIR, { recursive: true })
    }

    const results = []
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.mp3')) {
        results.push({ name: file.name, ok: false, error: 'MP3 uniquement' })
        continue
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(join(AUDIO_DIR, file.name), buffer)
      results.push({
        name: file.name,
        ok: true,
        url: `/api/audio/${encodeURIComponent(file.name)}`,
        size: file.size,
      })
    }

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Augmenter la limite de taille pour les gros fichiers MP3
export const config = {
  api: { bodyParser: false },
}
