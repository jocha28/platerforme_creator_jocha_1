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

export function formatPlays(plays: number | undefined | null): string {
  if (!plays) return '0'
  return new Intl.NumberFormat('fr-FR').format(plays).replace(/\u00a0/g, ' ')
}

export interface Certification {
  label: string
  disc: 'or' | 'platine' | 'diamant'
  color: string
  count: number // multiplicateur (ex: 2 pour "Double Platine")
}

/**
 * Certification par single — calé sur la distribution réelle (5M plays / 156 titres)
 *   Or      ≥  60 000 plays  (~top 5-10% des titres)
 *   Platine ≥ 100 000 plays  (~top 3-4%)
 *   Diamant ≥ 300 000 plays  (~top 1-2%)
 */
export function getSingleCertification(plays: number): Certification | null {
  if (plays >= 300_000) return { label: 'Diamant', disc: 'diamant', color: 'text-cyan-300',   count: 1 }
  if (plays >= 100_000) return { label: 'Platine', disc: 'platine', color: 'text-slate-300',  count: 1 }
  if (plays >=  60_000) return { label: 'Or',      disc: 'or',      color: 'text-yellow-400', count: 1 }
  return null
}

/**
 * Certification par album/EP — basée sur le total des écoutes de l'album
 *   Or              ≥    500 000 écoutes totales
 *   Platine         ≥  1 000 000
 *   Double Platine  ≥  2 000 000
 *   Triple Platine  ≥  3 000 000
 *   Diamant         ≥  5 000 000
 *   Double Diamant  ≥ 10 000 000
 *   Triple Diamant  ≥ 15 000 000
 *   Quadruple Diamant ≥ 20 000 000
 */
export function getAlbumCertification(plays: number): Certification | null {
  if (plays >= 20_000_000) return { label: 'Diamant', disc: 'diamant', color: 'text-cyan-300',   count: 4 }
  if (plays >= 15_000_000) return { label: 'Diamant', disc: 'diamant', color: 'text-cyan-300',   count: 3 }
  if (plays >= 10_000_000) return { label: 'Diamant', disc: 'diamant', color: 'text-cyan-300',   count: 2 }
  if (plays >=  5_000_000) return { label: 'Diamant', disc: 'diamant', color: 'text-cyan-300',   count: 1 }
  if (plays >=  3_000_000) return { label: 'Platine', disc: 'platine', color: 'text-slate-300',  count: 3 }
  if (plays >=  2_000_000) return { label: 'Platine', disc: 'platine', color: 'text-slate-300',  count: 2 }
  if (plays >=  1_000_000) return { label: 'Platine', disc: 'platine', color: 'text-slate-300',  count: 1 }
  if (plays >=    500_000) return { label: 'Or',       disc: 'or',      color: 'text-yellow-400', count: 1 }
  return null
}
