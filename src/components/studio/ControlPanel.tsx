'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music2, Palette, Type, Layout, Wand2, RefreshCw } from 'lucide-react'
import { StudioState, TemplateId, StudioMode } from '@/types/studio'
import { usePlaylist } from '@/context/PlaylistContext'
import { Track } from '@/types'

interface Props {
  state: StudioState
  setState: (s: StudioState) => void
}

export default function ControlPanel({ state, setState }: Props) {
  const [activeTab, setActiveTab] = useState<'template' | 'content' | 'style'>('template')
  const { playlists } = usePlaylist()
  
  // Extraire tous les morceaux uniques de toutes les playlists
  const allTracks = Array.from(new Set(playlists.flatMap(p => p.trackIds)))
    .map(id => {
      // Pour cet exemple, on simplifie car les objets Track entiers ne sont pas forcément dispos ici
      // Normalement on les récupère via un hook useTracks ou similaire
      return { id } 
    })

  const templates: { id: TemplateId; label: string; icon: string }[] = [
    { id: 'now-playing', label: 'Now Playing', icon: 'play_circle' },
    { id: 'release', label: 'Nouveauté', icon: 'new_releases' },
    { id: 'stats', label: 'Statistiques', icon: 'monitoring' },
    { id: 'lyrics', label: 'Paroles', icon: 'format_quote' },
  ]

  const updateConfig = (updates: Partial<typeof state.config>) => {
    setState({
      ...state,
      config: { ...state.config, ...updates }
    })
  }

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      
      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10 bg-surface-container-high/50">
        {[
          { id: 'template', label: 'Modèle', icon: Layout },
          { id: 'content', label: 'Contenu', icon: Music2 },
          { id: 'style', label: 'Style', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-y-auto max-h-[600px]">
        {/* TEMPLATE TAB */}
        {activeTab === 'template' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setState({ ...state, templateId: t.id })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  state.templateId === t.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-outline-variant/10 bg-surface-container hover:border-primary/50'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">{t.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex p-1 bg-surface-container rounded-xl">
              <button 
                onClick={() => setState({ ...state, mode: 'auto' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  state.mode === 'auto' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant'
                }`}
              >
                Auto
              </button>
              <button 
                onClick={() => setState({ ...state, mode: 'manual' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  state.mode === 'manual' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant'
                }`}
              >
                Manuel
              </button>
            </div>

            {state.mode === 'manual' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Titre</label>
                  <input 
                    type="text" 
                    value={state.config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Artiste</label>
                  <input 
                    type="text" 
                    value={state.config.artist}
                    onChange={(e) => updateConfig({ artist: e.target.value })}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:border-primary"
                  />
                </div>
                
                {state.templateId === 'lyrics' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Paroles (Lyrics)</label>
                    <textarea 
                      value={state.config.lyricsText}
                      onChange={(e) => updateConfig({ lyricsText: e.target.value })}
                      placeholder="Tapez les paroles ici..."
                      rows={4}
                      className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                )}

                {state.templateId === 'stats' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Label Stat</label>
                      <input 
                        type="text" 
                        value={state.config.stats?.label}
                        onChange={(e) => updateConfig({ stats: { ...state.config.stats!, label: e.target.value } })}
                        className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Valeur</label>
                      <input 
                        type="text" 
                        value={state.config.stats?.value}
                        onChange={(e) => updateConfig({ stats: { ...state.config.stats!, value: e.target.value } })}
                        className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant bg-surface-container/30 rounded-3xl border border-dashed border-outline-variant/20">
                <Music2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium px-8">Le mode automatique chargera vos titres réels dans la prochaine mise à jour.</p>
                <button 
                  onClick={() => setState({ ...state, mode: 'manual' })}
                  className="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  Utiliser le mode Manuel pour l'instant
                </button>
              </div>
            )}
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Couleur Primaire</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={state.config.primaryColor}
                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent overflow-hidden border-none p-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono opacity-50 uppercase">{state.config.primaryColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Couleur Texte</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={state.config.textColor}
                    onChange={(e) => updateConfig({ textColor: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent overflow-hidden border-none p-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono opacity-50 uppercase">{state.config.textColor}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Presets de Couleurs</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { p: '#E8B800', s: '#0F0D0A', t: '#FFFFFF', label: 'Jocha Classic' },
                  { p: '#FF0055', s: '#220011', t: '#FFFFFF', label: 'Neon Rose' },
                  { p: '#00F2FF', s: '#001A1D', t: '#FFFFFF', label: 'Cyber Cyan' },
                  { p: '#7000FF', s: '#0B001F', t: '#FFFFFF', label: 'Deep Violet' },
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => updateConfig({ primaryColor: preset.p, secondaryColor: preset.s, textColor: preset.t })}
                    className="group flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl border border-outline-variant/10 hover:border-primary transition-all"
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.p }} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
