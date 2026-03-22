/**
 * Met à jour tous les audioUrl de tracks.ts vers Archive.org
 * Usage: node scripts/update-audio-urls.mjs TON_IDENTIFIER
 * Ex:    node scripts/update-audio-urls.mjs jocha-music
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const identifier = process.argv[2]
if (!identifier) {
  console.error('❌  Donne ton identifiant Archive.org en argument')
  console.error('    node scripts/update-audio-urls.mjs jocha-music')
  process.exit(1)
}

const BASE = `https://archive.org/download/${identifier}/`

const filePath = join(dirname(fileURLToPath(import.meta.url)), '../src/data/tracks.ts')
let content = readFileSync(filePath, 'utf-8')

// Remplace toutes les occurrences de audioUrl: '/music/XXXX.mp3'
// par audioUrl: 'https://archive.org/download/IDENTIFIER/XXXX.mp3' (URL-encodé)
content = content.replace(
  /audioUrl:\s*'\/music\/([^']+)'/g,
  (_, filename) => {
    const encoded = filename.split('').map(c => {
      // Encode uniquement les caractères qui posent problème dans les URLs
      if (/[A-Za-z0-9\-_.~]/.test(c)) return c
      return encodeURIComponent(c)
    }).join('')
    return `audioUrl: '${BASE}${encoded}'`
  }
)

writeFileSync(filePath, content, 'utf-8')
console.log(`✅  tracks.ts mis à jour → ${BASE}`)
console.log(`    Vérification : grep les 3 premières lignes modifiées…`)

const lines = content.split('\n').filter(l => l.includes('archive.org'))
lines.slice(0, 3).forEach(l => console.log('   ', l.trim()))
console.log(`    … et ${lines.length - 3} autres`)
