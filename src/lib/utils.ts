import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatPlays(plays: number): string {
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M`
  if (plays >= 1_000) return `${(plays / 1_000).toFixed(1)}k`
  return plays.toString()
}
