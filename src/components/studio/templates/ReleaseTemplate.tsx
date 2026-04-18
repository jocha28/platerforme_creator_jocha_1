'use client'

import { motion } from 'framer-motion'
import { StudioConfig } from '@/types/studio'

interface Props {
  config: StudioConfig
}

export default function ReleaseTemplate({ config }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-24 p-8 relative overflow-hidden bg-black">
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-x-0 top-0 h-1/2 opacity-30 blur-[120px]"
        style={{ backgroundColor: config.primaryColor }}
      />

      {/* NEW RELEASE Tag */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 z-10"
      >
        <span 
          className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.4em] border border-white/20"
          style={{ backgroundColor: `${config.primaryColor}33`, color: config.primaryColor }}
        >
          New Release
        </span>
      </motion.div>

      {/* Album Art with Floating Animation */}
      <motion.div 
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-[85%] aspect-square mb-12 z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
      >
        <img 
          src={config.albumArt} 
          alt={config.title}
          className="w-full h-full object-cover rounded-xl"
        />
        {/* Glow behind art */}
        <div 
          className="absolute inset-0 -z-10 blur-3xl opacity-40 scale-110"
          style={{ backgroundColor: config.primaryColor }}
        />
      </motion.div>

      {/* Main Title Section */}
      <div className="w-full z-10 space-y-4">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-headline font-black uppercase tracking-tighter leading-none"
          style={{ color: '#FFFFFF' }}
        >
          {config.title}
        </motion.h1>
        
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-1 w-20"
          style={{ backgroundColor: config.primaryColor }}
        />

        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-bold uppercase tracking-widest text-[#FFFFFF]/60"
        >
          By {config.artist}
        </motion.p>
      </div>

      {/* OUT NOW Banner at the bottom */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 inset-x-0 h-32 flex items-center justify-center overflow-hidden rotate-[-2deg] scale-110"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-4xl font-black uppercase tracking-tighter text-black/80">
              OUT NOW • DISPONIBLE PARTOUT • 
            </span>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
