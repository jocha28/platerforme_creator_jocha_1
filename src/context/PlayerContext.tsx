'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { Track } from '@/types'
import { JOCHA_TRACKS } from '@/data/tracks'
import { getInitData, invalidateInitCache } from '@/lib/init-fetch'

const STORAGE_KEY = 'jocha_player_session'

type RepeatMode = 'off' | 'all' | 'one'

interface SavedSession {
  trackId: string
  queueIds: string[]
  currentTime: number
  volume: number
  isShuffle: boolean
  repeatMode: RepeatMode
}

function saveSession(data: SavedSession) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedSession) : null
  } catch { return null }
}

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  isShuffle: boolean
  repeatMode: RepeatMode
  playCounts: Record<string, number>
  recentTrackIds: string[]
  weeklyTopTrackIds: string[]
  weeklyTopReleaseIds: string[]
  crossfade: boolean
  crossfadeDuration: number
}

interface PlayerActions {
  play: (track: Track, queue?: Track[], isPlaylist?: boolean) => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleFavorite: (trackId: string) => void
  setCrossfade: (enabled: boolean) => void
  setCrossfadeDuration: (duration: number) => void
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null)

export interface PlayerInitData {
  playCounts: Record<string, number>
  recentTrackIds: string[]
  weeklyTopTrackIds: string[]
  weeklyTopReleaseIds: string[]
}

export function PlayerProvider({ children, initialData }: { children: ReactNode, initialData?: PlayerInitData }) {
  // 1. Initial State - Must match server exactly
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [queue, setQueue] = useState<Track[]>([])
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(initialData?.playCounts ?? {})
  const [recentTrackIds, setRecentTrackIds] = useState<string[]>(initialData?.recentTrackIds ?? [])
  const [weeklyTopTrackIds, setWeeklyTopTrackIds] = useState<string[]>(initialData?.weeklyTopTrackIds ?? [])
  const [weeklyTopReleaseIds, setWeeklyTopReleaseIds] = useState<string[]>(initialData?.weeklyTopReleaseIds ?? [])
  const [crossfade, setCrossfade] = useState(true)
  const [crossfadeDuration, setCrossfadeDuration] = useState(5)

  // 2. Refs for Audio & Logic
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const secondaryAudioRef = useRef<HTMLAudioElement | null>(null)
  const activeAudioKey = useRef<'primary' | 'secondary'>('primary')
  const isTransitioningRef = useRef(false)
  const volumeRef = useRef(0.7)
  const queueRef = useRef<Track[]>([])
  const currentTrackRef = useRef<Track | null>(null)
  const isShuffleRef = useRef(false)
  const repeatModeRef = useRef<RepeatMode>('off')
  const crossfadeRef = useRef(true)
  const crossfadeDurRef = useRef(5)

  const [isPlaylistSource, setIsPlaylistSource] = useState(false)
  const isPlaylistSourceRef = useRef(false)

  // Sync refs
  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])
  useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
  useEffect(() => { repeatModeRef.current = repeatMode }, [repeatMode])
  useEffect(() => { crossfadeRef.current = crossfade }, [crossfade])
  useEffect(() => { crossfadeDurRef.current = crossfadeDuration }, [crossfadeDuration])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { isPlaylistSourceRef.current = isPlaylistSource }, [isPlaylistSource])

  // Load Session on Mount
  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      const track = JOCHA_TRACKS.find(t => t.id === saved.trackId)
      if (track) setCurrentTrack(track)
      const q = saved.queueIds.map(id => JOCHA_TRACKS.find(t => t.id === id)).filter(Boolean) as Track[]
      setQueue(q)
      setCurrentTime(saved.currentTime)
      setVolumeState(saved.volume)
      setIsShuffle(saved.isShuffle)
      setRepeatMode(saved.repeatMode)
      
      // Sync audio with saved track if it exists
      if (track?.audioUrl && audioRef.current) {
        audioRef.current.src = track.audioUrl
        audioRef.current.load()
        audioRef.current.currentTime = saved.currentTime
      }
    }
  }, [])

  // 3. Audio Initialization (Run ONCE)
  useEffect(() => {
    const a1 = new Audio(); const a2 = new Audio()
    audioRef.current = a1; secondaryAudioRef.current = a2
    a1.volume = volumeRef.current; a2.volume = 0

    const setup = (audio: HTMLAudioElement, key: 'primary' | 'secondary') => {
      audio.addEventListener('timeupdate', () => {
        if (activeAudioKey.current === key) {
          setCurrentTime(audio.currentTime)
          // Crossfade Check - ONLY IF SOURCE IS PLAYLIST
          if (crossfadeRef.current && isPlaylistSourceRef.current && !isTransitioningRef.current && audio.duration > 0 && 
              audio.currentTime >= (audio.duration - crossfadeDurRef.current) && repeatModeRef.current !== 'one') {
            startCrossfadeInternal()
          }
        }
      })
      audio.addEventListener('loadedmetadata', () => {
        if (activeAudioKey.current === key) setDuration(audio.duration)
      })
      audio.addEventListener('ended', () => {
        if (activeAudioKey.current === key && !isTransitioningRef.current) handleTrackEndedInternal()
      })
    }
    setup(a1, 'primary'); setup(a2, 'secondary')

    return () => { a1.pause(); a2.pause(); a1.src = ''; a2.src = '' }
  }, [])

  // 4. Core Logic Functions (defined with refs to avoid recreation)
  const updateMediaSession = (track: Track) => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title, artist: track.artist, album: track.albumTitle,
      artwork: track.albumArt ? [{ src: track.albumArt, sizes: '512x512', type: 'image/jpeg' }] : []
    })
  }

  const startCrossfadeInternal = () => {
    if (isTransitioningRef.current) return
    const q = queueRef.current; const cur = currentTrackRef.current
    if (!cur || q.length === 0) return

    const idx = q.findIndex(t => t.id === cur.id)
    const nextIdx = isShuffleRef.current ? Math.floor(Math.random() * q.length) : (idx + 1) % q.length
    const nextTrack = q[nextIdx]
    if (!nextTrack) return

    isTransitioningRef.current = true
    const active = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    const next = activeAudioKey.current === 'primary' ? secondaryAudioRef.current : audioRef.current
    if (!active || !next) return

    next.src = nextTrack.audioUrl ?? ''; next.volume = 0; next.play().catch(() => {})
    setCurrentTrack(nextTrack); updateMediaSession(nextTrack)

    const steps = 30; const stepDur = (crossfadeDurRef.current * 1000) / steps; let step = 0
    const interval = setInterval(() => {
      step++; const progress = step / steps
      if (active) active.volume = Math.max(0, volumeRef.current * (1 - progress))
      if (next) next.volume = Math.min(volumeRef.current, volumeRef.current * progress)
      if (step >= steps) {
        clearInterval(interval); active.pause(); active.currentTime = 0
        activeAudioKey.current = activeAudioKey.current === 'primary' ? 'secondary' : 'primary'
        isTransitioningRef.current = false
      }
    }, stepDur)
  }

  const handleTrackEndedInternal = () => {
    const q = queueRef.current; const cur = currentTrackRef.current
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (repeatModeRef.current === 'one' && audio) {
      audio.currentTime = 0; audio.play().catch(() => {})
      return
    }
    if (cur && q.length > 0) {
      const idx = q.findIndex(t => t.id === cur.id)
      const nextIdx = isShuffleRef.current ? Math.floor(Math.random() * q.length) : idx + 1
      const nextTrack = q[nextIdx] || (repeatModeRef.current === 'all' ? q[0] : null)
      if (nextTrack) play(nextTrack)
      else setIsPlaying(false)
    }
  }

  // 5. Exposed Actions
  const play = useCallback((track: Track, newQueue?: Track[], isPlaylist?: boolean) => {
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (!audio) return
    isTransitioningRef.current = false
    audio.src = track.audioUrl ?? ''; audio.volume = volumeRef.current
    audio.play().catch(err => console.error('Play failed:', err))
    setCurrentTrack(track); setCurrentTime(0); setIsPlaying(true)
    
    if (newQueue) {
      setQueue(newQueue)
      // Auto-detect if it's a playlist: if tracks come from more than 1 album
      const albumIds = new Set(newQueue.map(t => t.albumId))
      const detectedIsPlaylist = isPlaylist ?? (albumIds.size > 1)
      setIsPlaylistSource(detectedIsPlaylist)
    } else if (isPlaylist !== undefined) {
      setIsPlaylistSource(isPlaylist)
    }

    updateMediaSession(track)
  }, [])

  const toggle = useCallback(() => {
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (!audio || !currentTrackRef.current) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play().catch(() => {}); setIsPlaying(true) }
  }, [isPlaying])

  const next = useCallback(() => {
    const q = queueRef.current; const cur = currentTrackRef.current
    if (!cur || q.length === 0) return
    const idx = q.findIndex(t => t.id === cur.id)
    const nextIdx = isShuffleRef.current ? Math.floor(Math.random() * q.length) : (idx + 1) % q.length
    play(q[nextIdx])
  }, [play])

  const prev = useCallback(() => {
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; setCurrentTime(0); return }
    const q = queueRef.current; const cur = currentTrackRef.current
    if (!cur || q.length === 0) return
    const idx = q.findIndex(t => t.id === cur.id)
    const prevIdx = idx === 0 ? q.length - 1 : idx - 1
    play(q[prevIdx])
  }, [play])

  const seek = useCallback((t: number) => {
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (audio) audio.currentTime = t
    setCurrentTime(t)
  }, [])

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v)); setVolumeState(vol)
    const audio = activeAudioKey.current === 'primary' ? audioRef.current : secondaryAudioRef.current
    if (audio) audio.volume = vol
  }, [])

  // 6. Data Fetching & Session Persistence
  useEffect(() => {
    invalidateInitCache()
    getInitData().then(data => {
      if (data.playCounts) setPlayCounts(data.playCounts)
      if (data.recentTrackIds) setRecentTrackIds(data.recentTrackIds)
      if (data.weeklyTopTrackIds) setWeeklyTopTrackIds(data.weeklyTopTrackIds)
      if (data.weeklyTopReleaseIds) setWeeklyTopReleaseIds(data.weeklyTopReleaseIds)
    })
  }, [])

  useEffect(() => {
    if (currentTrack) {
      saveSession({
        trackId: currentTrack.id, queueIds: queue.map(t => t.id),
        currentTime, volume, isShuffle, repeatMode
      })
    }
  }, [currentTrack, currentTime, queue, volume, isShuffle, repeatMode])

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, queue, isShuffle, repeatMode,
      playCounts, recentTrackIds, weeklyTopTrackIds, weeklyTopReleaseIds, crossfade, crossfadeDuration,
      play, pause: () => { audioRef.current?.pause(); secondaryAudioRef.current?.pause(); setIsPlaying(false) },
      toggle, next, prev, seek, setVolume, toggleShuffle: () => setIsShuffle(s => !s),
      toggleRepeat: () => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'),
      toggleFavorite: (id) => setFavorites(f => {
        const n = new Set(f); if (n.has(id)) n.delete(id); else n.add(id); return n
      }),
      setCrossfade, setCrossfadeDuration
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext); if (!ctx) throw new Error('usePlayer error'); return ctx
}