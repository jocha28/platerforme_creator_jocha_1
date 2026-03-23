export interface LyricsMeta {
  bpm?: number
  key?: string
  mode?: string
  theme: string
  themeLabel: string
  description: string
  year?: number
  /** Commentaires de l'artiste sur des lignes spécifiques (index dans le tableau de paroles) */
  annotations?: {
    lineIndex: number
    comment: string
    year?: number
  }[]
}

const LYRICS_META: Record<string, LyricsMeta> = {
  'jk-001': {
    bpm: 140,
    key: 'Dm',
    mode: 'MINEUR',
    theme: 'Authenticité & Rupture',
    themeLabel: 'Thème central',
    description:
      '404: HYPE NOT FOUND est un manifeste contre la superficialité des réseaux sociaux et de l\'industrie musicale. Jocha y pose les bases de son identité : un développeur-rappeur qui refuse les codes du buzz facile et préfère construire quelque chose de vrai.',
    year: 2024,
    annotations: [
      {
        lineIndex: 0,
        comment:
          '"Pull un commit dans vos vies" — j\'ai écrit ce couplet en pleine session de dev à 3h du matin. L\'idée était de décrire mon arrivée dans le rap comme un push de code : brutal, direct, sans merge request.',
        year: 2024,
      },
      {
        lineIndex: 6,
        comment:
          '"Take off" est un refrain que j\'ai construit comme une liste de commandes système. Chaque ligne retire quelque chose de faux. C\'est presque une fonction de nettoyage.',
        year: 2024,
      },
    ],
  },
  'jk-002': {
    bpm: 88,
    key: 'Am',
    mode: 'MINEUR',
    theme: 'Identité & Résilience',
    themeLabel: 'Thème central',
    description:
      'ADN Brut explore la construction identitaire à l\'ère numérique. Entre algorithmes et émotions brutes, Jocha questionne ce qui reste de l\'humain quand tout est filtré, mesuré, optimisé.',
    year: 2024,
    annotations: [
      {
        lineIndex: 0,
        comment:
          '"Dans mon ADN c\'est codé" — cette ligne, c\'est la réponse à tous ceux qui me demandaient si le rap était "sérieux" pour moi. C\'est génétique. Je ne peux pas faire autrement.',
        year: 2024,
      },
    ],
  },
  'jk-003': {
    bpm: 95,
    key: 'Gm',
    mode: 'MINEUR',
    theme: 'Attraction & Élévation',
    themeLabel: 'Thème central',
    description:
      'Alien Commit raconte une connexion rare, presque inexplicable — une personne qui défie toutes les logiques du système. Le champ lexical spatial et informatique sert à décrire quelque chose d\'humain et de fragile : tomber amoureux.',
    year: 2024,
    annotations: [
      {
        lineIndex: 5,
        comment:
          '"Même mes logs peuvent pas tracer" — j\'ai voulu dire qu\'il y a des choses qui échappent à toute rationalisation. Même un dev ne peut pas tout logguer.',
        year: 2024,
      },
    ],
  },
}

export function getLyricsMeta(trackId: string): LyricsMeta | null {
  return LYRICS_META[trackId] ?? null
}
