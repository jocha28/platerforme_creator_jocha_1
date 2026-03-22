'use client'

import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export default function Chip({ label, active = false, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'font-label text-sm font-semibold tracking-widest uppercase pb-4 transition-colors whitespace-nowrap',
        active
          ? 'text-primary border-b-2 border-primary'
          : 'text-on-surface-variant/60 hover:text-on-surface border-b-2 border-transparent',
        className
      )}
    >
      {label}
    </button>
  )
}
