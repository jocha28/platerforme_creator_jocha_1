import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }

export default function Avatar({ src, alt = 'Avatar', size = 'sm', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 shrink-0', sizeMap[size], className)}>
      {src ? (
        <Image src={src} alt={alt} width={48} height={48} className="w-full h-full object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}
