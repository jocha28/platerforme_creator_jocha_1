export type TemplateId = 'now-playing' | 'release' | 'stats'
export type StudioMode = 'auto' | 'manual'

export interface StudioConfig {
  title: string
  artist: string
  albumArt: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  showWaveform?: boolean
  stats?: {
    label: string
    value: string
    icon: string
  }
}

export interface StudioState {
  templateId: TemplateId
  mode: StudioMode
  config: StudioConfig
}
