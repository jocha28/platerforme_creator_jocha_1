'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ArtistProfile {
  name: string
  avatar: string
  coverPhoto: string
  bio: string
  genres: string[]
  location: string
  website: string
  yearsActive: string
}

interface ArtistContextValue {
  profile: ArtistProfile
  updateProfile: (updates: Partial<ArtistProfile>) => void
}

const DEFAULT_PROFILE: ArtistProfile = {
  name: 'Synthetix',
  coverPhoto: '',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBcAW6oUGQK8oPMQq0ytrwOAON-oFN51vQ_5XZL4O89cLP-6Rx_dMvCANE0amwVjdeaI3QD_Fa2Nj80I313Blamxjb2TfEaCF2SaTIYKqw5HFpJbE2mgr_EwNm1zjSbYy8Mp6rET6pGfvs2StDYIgYohzDSDB0GQ7C9wTPdSdo2nrz5T6D-0cQ1FUlG-u0QaE2PzFpb7P9s6UulilV5YlfFoli804kD2zLZBj_E5e_bEPbdKIsJqs-WAqL8Sue6oE_3Bo96zy5JUOYy',
  bio: "Synthetix est un projet musical né en 2021 de la convergence entre production électronique expérimentale et esthétique visuelle. Chaque release explore un territoire sonore distinct — du silence ambiant aux structures techno industrielles — créant une discographie cohérente et sans compromis.",
  genres: ['Electronic', 'Ambient', 'Synthwave', 'Techno', 'Industrial'],
  location: '',
  website: '',
  yearsActive: '2021',
}

const ArtistContext = createContext<ArtistContextValue | null>(null)

const STORAGE_KEY = 'jocha_artist_profile'

export function ArtistProvider({ children }: { children: ReactNode }) {
  // Toujours démarrer avec DEFAULT_PROFILE (server + client identiques = pas de mismatch)
  const [profile, setProfile] = useState<ArtistProfile>(DEFAULT_PROFILE)

  // Après montée côté client, charger depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function updateProfile(updates: Partial<ArtistProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...updates }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <ArtistContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ArtistContext.Provider>
  )
}

export function useArtist() {
  const ctx = useContext(ArtistContext)
  if (!ctx) throw new Error('useArtist must be used inside ArtistProvider')
  return ctx
}
