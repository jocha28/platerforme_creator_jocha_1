'use client'

import { motion } from 'framer-motion'
import { StudioConfig } from '@/types/studio'

interface Props { config: StudioConfig }

export default function StatsTemplate({ config }: Props) {
  const stats = config.stats || { label: 'Streams', value: '1M+', icon: 'trending_up' }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative bg-[#0A0A0A]">
      
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${config.primaryColor} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      {/* Floating Blobs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: config.primaryColor }} />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: config.primaryColor }} />

      {/* Main Card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-[#1A1A1A]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 flex flex-col items-center justify-between min-h-[500px] relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            style={{ backgroundColor: config.primaryColor }}
          >
            <span className="material-symbols-outlined text-black text-3xl font-bold">
              {stats.icon}
            </span>
          </motion.div>
          <h3 className="text-white/50 font-label text-sm font-black uppercase tracking-[0.3em] mb-2">
            Objectif Atteint
          </h3>
        </div>

        {/* Huge Value */}
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-7xl font-headline font-black uppercase tracking-tighter"
            style={{ color: config.primaryColor }}
          >
            {stats.value}
          </motion.div>
          <div className="text-xl font-bold uppercase tracking-widest text-white mt-2">
            {stats.label}
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full border-t border-white/5 pt-8 mt-4 flex items-center gap-4">
          <img src={config.albumArt} className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1 text-left">
            <div className="text-xs font-black uppercase tracking-wider text-white">
              {config.title}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">
              {config.artist}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Certified Badge */}
      <motion.div 
        initial={{ rotate: -15, scale: 0 }}
        animate={{ rotate: 5, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-16 right-4 w-28 h-28 bg-white text-black rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-black z-20"
      >
        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Certifié</span>
        <span className="text-sm font-black uppercase tracking-tighter">Jocha</span>
        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Classic</span>
      </motion.div>

    </div>
  )
}
