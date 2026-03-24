'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { Track } from '@/types'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  isShuffle: boolean
  isRepeat: boolean
  playCounts: Record<string, number>
}

interface PlayerActions {
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleFavorite: (trackId: string) => void
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [queue, setQueue] = useState<Track[]>([])
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({})

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Audio secondaire pour précharger le prochain son
  const preloadRef = useRef<HTMLAudioElement | null>(null)
  const preloadedIdRef = useRef<string | null>(null)
  // En mode shuffle, on fixe le prochain son à l'avance pour pouvoir le précharger
  const preloadedNextTrackRef = useRef<Track | null>(null)
  // Refs miroirs pour les closures du listener 'ended' (évite le stale closure)
  const queueRef = useRef<Track[]>([])
  const currentTrackRef = useRef<Track | null>(null)
  const isShuffleRef = useRef(false)
  const isRepeatRef = useRef(false)

  // Synchroniser les refs avec les états
  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])
  useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
  useEffect(() => { isRepeatRef.current = isRepeat }, [isRepeat])

  // Charger les play counts depuis le serveur après montage
  useEffect(() => {
    fetch('/api/play-counts')
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, number>) => setPlayCounts(data))
      .catch(() => {})
  }, [])

  // Initialise l'élément audio une seule fois côté client
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = 0.7

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)

      // Précharger le prochain son 40 secondes avant la fin
      if (audio.duration > 0 && audio.duration - audio.currentTime < 40) {
        const q = queueRef.current
        const cur = currentTrackRef.current
        if (cur && q.length > 0 && preloadedIdRef.current === null) {
          const idx = q.findIndex((t) => t.id === cur.id)
          let nextTrack: Track | undefined

          if (isShuffleRef.current) {
            // Shuffle : choisir maintenant le prochain son aléatoire et le mémoriser
            const candidates = q.filter((t) => t.id !== cur.id)
            if (candidates.length > 0) {
              nextTrack = candidates[Math.floor(Math.random() * candidates.length)]
              preloadedNextTrackRef.current = nextTrack
            }
          } else {
            const nextIdx = idx + 1
            if (nextIdx < q.length) nextTrack = q[nextIdx]
          }

          if (nextTrack?.audioUrl) {
            const pre = new Audio()
            pre.preload = 'auto'
            pre.src = nextTrack.audioUrl
            pre.load()
            preloadRef.current = pre
            preloadedIdRef.current = nextTrack.id
          }
        }
      }
    })
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => {
      const q = queueRef.current
      const cur = currentTrackRef.current
      const shuffle = isShuffleRef.current
      const repeat = isRepeatRef.current

      if (repeat && audio.src) {
        // Rejouer le même son
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }

      if (cur && q.length > 0) {
        const idx = q.findIndex((t) => t.id === cur.id)

        // Déterminer le prochain son : priorité au son préchargé (shuffle ou non)
        let nextTrack: Track | undefined
        if (preloadRef.current && preloadedIdRef.current) {
          // Shuffle : utiliser le son déjà tiré au sort lors du préchargement
          nextTrack = shuffle
            ? (preloadedNextTrackRef.current ?? undefined)
            : q[idx + 1]
          // Fallback si la ref est perdue
          if (!nextTrack) nextTrack = q.find((t) => t.id === preloadedIdRef.current) ?? q[idx + 1]
        } else {
          const nextIdx = shuffle
            ? Math.floor(Math.random() * q.length)
            : idx + 1
          nextTrack = nextIdx < q.length ? q[nextIdx] : undefined
        }

        if (nextTrack) {
          setCurrentTrack(nextTrack)
          setCurrentTime(0)
          if (nextTrack.audioUrl) {
            // Utiliser l'audio préchargé si disponible
            if (preloadRef.current && preloadedIdRef.current === nextTrack.id) {
              audio.src = preloadRef.current.src
              audio.play().catch(() => {})
              preloadRef.current = null
              preloadedIdRef.current = null
              preloadedNextTrackRef.current = null
            } else {
              audio.src = nextTrack.audioUrl
              audio.load()
              audio.play().catch(() => {})
            }
          }
          setIsPlaying(true)
          setPlayCounts((prev) => ({ ...prev, [nextTrack!.id]: (prev[nextTrack!.id] ?? 0) + 1 }))
          fetch('/api/play-counts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: nextTrack!.id }),
          }).catch(() => {})
        } else {
          // Fin de la file
          setIsPlaying(false)
          setCurrentTime(0)
        }
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume))
  }, [volume])

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTrack(track)
    setCurrentTime(0)

    // Réinitialiser le preload si on change de son manuellement
    preloadRef.current = null
    preloadedIdRef.current = null
    preloadedNextTrackRef.current = null

    if (track.audioUrl) {
      audio.src = track.audioUrl
      audio.load()
      audio.play().catch(() => {})
    } else {
      setDuration(track.duration)
    }

    setIsPlaying(true)
    if (newQueue) setQueue(newQueue)

    // Incrémenter le play count (local + serveur)
    setPlayCounts((prev) => ({ ...prev, [track.id]: (prev[track.id] ?? 0) + 1 }))
    fetch('/api/play-counts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: track.id }),
    }).catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [currentTrack, isPlaying])

  const next = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const nextIdx = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (idx + 1) % queue.length
    play(queue[nextIdx], queue)
  }, [currentTrack, queue, isShuffle, play])

  const prev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prevIdx = idx === 0 ? queue.length - 1 : idx - 1
    play(queue[prevIdx], queue)
  }, [currentTrack, queue, play])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio && audio.src) {
      audio.currentTime = time
    }
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolumeState(clamped)
  }, [])

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), [])
  const toggleRepeat = useCallback(() => setIsRepeat((r) => !r), [])

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }, [])

  const enrichedTrack = currentTrack
    ? { ...currentTrack, isFavorite: favorites.has(currentTrack.id) || currentTrack.isFavorite }
    : null

  return (
    <PlayerContext.Provider value={{
      currentTrack: enrichedTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      queue,
      isShuffle,
      isRepeat,
      playCounts,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle,
      toggleRepeat,
      toggleFavorite,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
