'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ArtistProfile } from '@/types'

export type { ArtistProfile }

interface ArtistContextValue {
  profile: ArtistProfile
  updateProfile: (updates: Partial<ArtistProfile>) => Promise<void>
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

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArtistProfile>(DEFAULT_PROFILE)

  // Charger le profil depuis le serveur (source de vérité partagée entre tous les appareils)
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setProfile(data) })
      .catch(() => {})
  }, [])

  async function updateProfile(updates: Partial<ArtistProfile>): Promise<void> {
    const next = { ...profile, ...updates }
    setProfile(next)
    // Persister sur le serveur (images déjà uploadées séparément, pas de base64 ici)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {})
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
