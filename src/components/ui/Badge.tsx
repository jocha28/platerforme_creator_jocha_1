import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'primary' | 'secondary' | 'neutral'
  className?: string
}

const variantMap = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  neutral: 'bg-surface-container-high text-on-surface-variant',
}

export default function Badge({ label, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 font-label text-[10px] font-black uppercase tracking-widest',
        variantMap[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
