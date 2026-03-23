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
  name: 'Jocha',
  coverPhoto: '',
  avatar: '',
  bio: "Jocha est un rappeur français de la génération 2020s, dont l'univers sonore se situe au carrefour du conscious hip-hop, du drill et du cloud rap. Artiste inclassable, il a bâti une discographie dense et cohérente autour d'une identité forte : celle d'un développeur qui rappe, ou d'un rappeur qui code.\n\nDepuis ses débuts, Jocha impose un style reconnaissable — des flows tranchants sur des productions sombres, des textes qui parlent en termes de commits, de bugs, de logs et de serveurs, mais pour raconter des histoires profondément humaines : l'ambition, la résistance, la solitude numérique, la quête de sens.\n\n« J'fais du code propre, mental sale / J'rap comme un log d'erreur brutal. »\n\nSa discographie compte 134 titres répartis entre 97 singles, deux albums (Bug Royal, Cas Isolé) et un EP (Jeune Vieux), tous sortis entre 2025 et 2026. Chaque projet est une couche supplémentaire d'un même projet artistique — construire une œuvre qui fait du sens là où d'autres chassent les views et la hype.\n\nSes influences vont de Kendrick Lamar au rap français le plus consciencieux, tout en développant un langage propre — celui d'une génération qui pense en binaire et ressent en storm.",
  genres: ['Conscious Hip-Hop', 'French Rap', 'Cloud Rap', 'Drill', 'Dark Trap', 'Trap', 'Emo Rap', 'Underground Rap'],
  location: 'France',
  website: '',
  yearsActive: '2025',
}

const ArtistContext = createContext<ArtistContextValue | null>(null)

const STORAGE_KEY = 'jocha_artist_profile'
// Incrémenter ce numéro force la réinitialisation du profil pour tous les utilisateurs
const PROFILE_VERSION = 2

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArtistProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    try {
      const storedVersion = parseInt(localStorage.getItem('jocha_profile_version') ?? '0', 10)
      const stored = localStorage.getItem(STORAGE_KEY)

      if (!stored || storedVersion < PROFILE_VERSION) {
        // Première visite ou version obsolète : appliquer les nouveaux défauts
        // Conserver avatar et coverPhoto si l'utilisateur les avait personnalisés
        const prev = stored ? JSON.parse(stored) : {}
        const next = {
          ...DEFAULT_PROFILE,
          avatar: prev.avatar || DEFAULT_PROFILE.avatar,
          coverPhoto: prev.coverPhoto || DEFAULT_PROFILE.coverPhoto,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        localStorage.setItem('jocha_profile_version', String(PROFILE_VERSION))
        setProfile(next)
      } else {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) })
      }
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
