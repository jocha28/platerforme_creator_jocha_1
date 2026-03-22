'use client'

import { cn } from '@/lib/utils'

interface MaterialIconProps {
  name: string
  filled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export default function MaterialIcon({
  name,
  filled = false,
  className,
  size = 'md',
}: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none', sizeMap[size], className)}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  )
}
