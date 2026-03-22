'use client'

import { useState, useEffect } from 'react'
import LogoOwl from '@/components/ui/LogoOwl'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    // Ne montrer qu'une seule fois par session
    const seen = sessionStorage.getItem('splash_seen')
    if (seen) return

    setVisible(true)

    const fadeTimer = setTimeout(() => setHiding(true), 1800)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('splash_seen', '1')
    }, 2400)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`
        lg:hidden fixed inset-0 z-[200]
        bg-background flex flex-col items-center justify-center gap-6
        transition-opacity duration-500 ease-in-out
        ${hiding ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Halo lumineux derrière le logo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-52 h-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute w-36 h-36 rounded-full bg-primary/15 blur-2xl" />
        <LogoOwl
          size={120}
          className="text-primary relative z-10 drop-shadow-[0_0_24px_rgba(232,184,0,0.5)]"
        />
      </div>

      {/* Nom de l'artiste */}
      <div className="text-center space-y-1">
        <p className="font-headline text-3xl font-black uppercase tracking-[0.15em] text-on-background">
          Jocha
        </p>
        <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary opacity-80">
          Official
        </p>
      </div>

      {/* Barre de chargement */}
      <div className="w-24 h-0.5 bg-surface-container-high rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-primary rounded-full"
          style={{
            animation: 'splash-bar 1.6s ease-in-out forwards',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes splash-bar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
