'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, Settings2, Music2, Share2, History, Wand2 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useArtist } from '@/context/ArtistContext'
import SmartphonePreview from '@/components/studio/SmartphonePreview'
import ControlPanel from '@/components/studio/ControlPanel'
import { StudioState, TemplateId } from '@/types/studio'

export default function StudioPage() {
  const { profile } = useArtist()
  const previewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const [state, setState] = useState<StudioState>({
    templateId: 'now-playing',
    mode: 'auto',
    config: {
      title: 'Bug Royal',
      artist: profile.name,
      albumArt: '/covers/bug-royal.jpg',
      primaryColor: '#E8B800',
      secondaryColor: '#0F0D0A',
      textColor: '#FFFFFF',
      showWaveform: true,
      stats: {
        label: 'Streams',
        value: '12.5K',
        icon: 'trending_up'
      }
    }
  })

  const handleExport = async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Pour une qualité Instagram
      })
      const link = document.createElement('a')
      link.download = `jocha-studio-${state.templateId}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-primary mb-2"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-label text-sm font-bold uppercase tracking-widest text-primary/80">Social Studio</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter text-on-surface">
            Créez du contenu <br />
            <span className="text-primary italic">Viral en un clic.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isExporting ? 'Génération...' : 'Télécharger'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Preview (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center sticky top-24">
          <SmartphonePreview state={state} previewRef={previewRef} />
        </div>

        {/* Right: Controls (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
            <ControlPanel state={state} setState={setState} />
          </div>
          
          {/* Tip Card */}
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl flex gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0">
              <Wand2 className="text-on-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface mb-1">Astuce de Créateur</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Utilisez des couleurs contrastées pour vos Stories. Instagram compresse les images, donc plus le contraste est élevé, plus votre contenu restera net et accrocheur.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
