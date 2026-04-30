import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

export const findFileRecursive = (dir: string, target: string): string | null => {
  if (!existsSync(dir)) return null
  const entries = readdirSync(dir, { withFileTypes: true })
  
  // 1. Recherche exacte et avec nettoyage de préfixe dans ce dossier
  for (const entry of entries) {
    if (entry.isFile()) {
      const name = entry.name
      if (name === target) return join(dir, name)
      
      const cleanName = name.replace(/^\d+\s+-\s+/, '')
      if (cleanName === target) return join(dir, name)

      // Gérer aussi le cas "Title (2).mp3" -> "Title.mp3"
      const nameNoSuffix = name.replace(/\s*\(\d+\)\.mp3$/, '.mp3')
      if (nameNoSuffix === target) return join(dir, name)
    }
  }

  // 2. Recherche récursive dans les sous-dossiers
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findFileRecursive(join(dir, entry.name), target)
      if (found) return found
    }
  }
  
  return null
}
