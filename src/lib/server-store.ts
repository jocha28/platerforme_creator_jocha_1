import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), '.data')

// Cache mémoire — évite les lectures disque répétées
const memCache = new Map<string, unknown>()

export function readStore<T>(filename: string, fallback: T): T {
  // Toujours lire sur le disque pour l'historique et les compteurs pour éviter les désynchronisations
  const isCritical = filename === 'play-history.json' || filename === 'play-counts.json'
  
  if (!isCritical && memCache.has(filename)) return memCache.get(filename) as T
  const path = join(DATA_DIR, filename)
  if (!existsSync(path)) return fallback
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as T
    memCache.set(filename, data)
    return data
  } catch {
    return fallback
  }
}

export function writeStore<T>(filename: string, data: T): void {
  const path = join(DATA_DIR, filename)
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
  memCache.set(filename, data) // mettre à jour le cache immédiatement
}
