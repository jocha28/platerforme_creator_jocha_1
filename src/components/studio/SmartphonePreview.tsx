'use client'

import { motion } from 'framer-motion'
import { StudioState } from '@/types/studio'
import TemplateRenderer from './TemplateRenderer'

interface Props {
  state: StudioState
  previewRef: React.RefObject<HTMLDivElement | null>
}

export default function SmartphonePreview({ state, previewRef }: Props) {
  return (
    <div className="relative group">
      {/* Phone Frame Decoration */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 rounded-[64px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* The "iPhone" */}
      <div className="relative w-[320px] h-[640px] md:w-[360px] md:h-[720px] bg-black rounded-[56px] border-[12px] border-surface-container-high shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl z-50">
          <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-white/5" />
        </div>

        {/* Content to Export */}
        <div 
          ref={previewRef}
          className="w-full h-full relative"
          style={{ background: `linear-gradient(135deg, ${state.config.secondaryColor}, ${state.config.primaryColor}22)` }}
        >
          <TemplateRenderer state={state} />
        </div>

      </div>

      {/* Floating Indicators */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute -right-8 top-12 bg-surface-container-high border border-outline-variant/10 p-4 rounded-2xl shadow-xl backdrop-blur-xl"
      >
        <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Format</div>
        <div className="text-sm font-bold text-primary flex items-center gap-2">
          9:16 Portrait
        </div>
      </motion.div>
    </div>
  )
}
