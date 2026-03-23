import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), '.data')

export function readStore<T>(filename: string, fallback: T): T {
  const path = join(DATA_DIR, filename)
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

export function writeStore<T>(filename: string, data: T): void {
  const path = join(DATA_DIR, filename)
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}
