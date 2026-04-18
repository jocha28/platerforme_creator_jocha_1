'use client'

import { motion } from 'framer-motion'
import { StudioConfig } from '@/types/studio'

interface Props {
  config: StudioConfig
}

export default function NowPlayingTemplate({ config }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-40 blur-[100px]"
        style={{ backgroundColor: config.primaryColor }}
      />

      {/* Album Art Container */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-full aspect-square mb-12 z-10"
      >
        <div 
          className="absolute -inset-4 opacity-50 blur-2xl rounded-3xl"
          style={{ backgroundColor: config.primaryColor }}
        />
        <img 
          src={config.albumArt} 
          alt={config.title}
          className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-10 border border-white/10"
        />
      </motion.div>

      {/* Info Section */}
      <div className="w-full text-center z-10 mb-8">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-headline font-black uppercase tracking-tighter mb-2"
          style={{ color: config.textColor }}
        >
          {config.title}
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg opacity-80 font-bold uppercase tracking-wider"
          style={{ color: config.textColor }}
        >
          {config.artist}
        </motion.p>
      </div>

      {/* Waveform Animation (CSS only for export) */}
      <div className="flex items-end gap-1.5 h-16 z-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: [20, 48, 24, 60, 32][i % 5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.1
            }}
            className="w-2 rounded-full"
            style={{ backgroundColor: config.primaryColor }}
          />
        ))}
      </div>

      {/* Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: config.textColor }}>
          Jocha Platform
        </span>
      </div>

    </div>
  )
}
