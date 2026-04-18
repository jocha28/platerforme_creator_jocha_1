'use client'

import { motion } from 'framer-motion'
import { StudioConfig } from '@/types/studio'

interface Props {
  config: StudioConfig
}

export default function LyricsTemplate({ config }: Props) {
  const text = config.lyricsText || "Selectionne ou tape tes paroles ici..."

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 relative overflow-hidden bg-black">
      
      {/* Background with Album Art Blur */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={config.albumArt} 
          alt="" 
          className="w-full h-full object-cover blur-[80px] opacity-40 scale-125 saturate-150"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Decorative Quote Mark */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.1, scale: 1 }}
        className="absolute top-20 left-10 z-0"
      >
        <QuotationMarks weight="fill" size={120} className="text-white fill-current" />
      </motion.div>

      {/* Main Lyrics Text */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="relative z-10 w-full"
      >
        <p 
          className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tight leading-[1.15] text-center italic"
          style={{ color: config.textColor, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          {text}
        </p>
      </motion.div>

      {/* Artist & Song Signature */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.8 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-4 z-10 font-bold uppercase tracking-widest text-[10px]"
        style={{ color: config.textColor }}
      >
        <div className="w-8 h-1" style={{ backgroundColor: config.primaryColor }} />
        <div className="flex flex-col items-center gap-1">
          <span className="opacity-60">{config.artist}</span>
          <span className="text-primary" style={{ color: config.primaryColor }}>{config.title}</span>
        </div>
      </motion.div>

    </div>
  )
}

// Composant icône interne si Lucide n'a pas exactement ce qu'on veut
function QuotationMarks({ size, className }: { size: number, className?: string, weight?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 256 256" 
      className={className}
    >
      <path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72Zm116,0v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H156a16,16,0,0,1-16-16V72a16,16,0,0,1,16-16h60A16,16,0,0,1,232,72Z" />
    </svg>
  )
}
