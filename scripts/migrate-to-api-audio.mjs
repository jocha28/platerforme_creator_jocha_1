/**
 * Migre tous les audioUrl de tracks.ts de /music/ vers /api/audio/
 * Usage : node scripts/migrate-to-api-audio.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const filePath = join(root, 'src', 'data', 'tracks.ts')

let content = readFileSync(filePath, 'utf-8')
const before = (content.match(/audioUrl:/g) ?? []).length

content = content.replace(
  /audioUrl: '\/music\//g,
  "audioUrl: '/api/audio/"
)

const after = (content.match(/\/api\/audio\//g) ?? []).length
writeFileSync(filePath, content, 'utf-8')

console.log(`✅  ${after}/${before} audioUrl migrés → /api/audio/`)
