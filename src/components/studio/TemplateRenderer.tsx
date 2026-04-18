'use client'

import { StudioState } from '@/types/studio'
import NowPlayingTemplate from './templates/NowPlayingTemplate'
import ReleaseTemplate from './templates/ReleaseTemplate'
import StatsTemplate from './templates/StatsTemplate'

interface Props {
  state: StudioState
}

export default function TemplateRenderer({ state }: Props) {
  switch (state.templateId) {
    case 'now-playing':
      return <NowPlayingTemplate config={state.config} />
    case 'release':
      return <ReleaseTemplate config={state.config} />
    case 'stats':
      return <StatsTemplate config={state.config} />
    default:
      return null
  }
}
