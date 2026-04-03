'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { Track } from '@/types'
import { JOCHA_TRACKS } from '@/data/tracks'
import { getInitData } from '@/lib/init-fetch'

const STORAGE_KEY = 'jocha_player_session'
const CROSSFADE_DURATION = 5 // secondes de chevauchement

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
  const savedSession = typeof window !== 'undefined' ? loadSession() : null
  const savedTrack = savedSession ? JOCHA_TRACKS.find(t => t.id === savedSession.trackId) ?? null : null
  const savedQueueRaw = savedSession ? savedSession.queueIds.map(id => JOCHA_TRACKS.find(t => t.id === id)).filter(Boolean) as Track[] : []
  const savedQueue = savedQueueRaw.length > 0 && savedQueueRaw.every(t => t.albumId === savedQueueRaw[0].albumId)
    ? [...savedQueueRaw].sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    : savedQueueRaw

  const [currentTrack, setCurrentTrack] = useState<Track | null>(savedTrack)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(savedSession?.currentTime ?? 0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(savedSession?.volume ?? 0.7)
  const [queue, setQueue] = useState<Track[]>(savedQueue)
  const [isShuffle, setIsShuffle] = useState(savedSession?.isShuffle ?? false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(savedSession?.repeatMode ?? 'off')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({})

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)
  const preloadedIdRef = useRef<string | null>(null)
  const preloadedNextTrackRef = useRef<Track | null>(null)

  // Refs miroirs pour les closures
  const queueRef = useRef<Track[]>([])
  const currentTrackRef = useRef<Track | null>(null)
  const isShuffleRef = useRef(false)
  const isRepeatRef = useRef<RepeatMode>('off')

  // Crossfade
  const volumeRef = useRef<number>(savedSession?.volume ?? 0.7)
  const crossfadeActiveRef = useRef(false)
  const crossfadeRafRef = useRef<number | null>(null)

  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])
  useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
  useEffect(() => { isRepeatRef.current = repeatMode }, [repeatMode])

  useEffect(() => {
    getInitData().then(({ playCounts }) => { if (playCounts) setPlayCounts(playCounts) })
  }, [])

  const preloadNext = useCallback((currentTrackId: string, q: Track[], shuffle: boolean) => {
    if (preloadRef.current) {
      preloadRef.current.src = ''
      preloadRef.current = null
    }
    preloadedIdRef.current = null
    preloadedNextTrackRef.current = null

    if (q.length === 0) return

    let nextTrack: Track | undefined
    if (shuffle) {
      const candidates = q.filter((t) => t.id !== currentTrackId)
      if (candidates.length > 0) {
        nextTrack = candidates[Math.floor(Math.random() * candidates.length)]
        preloadedNextTrackRef.current = nextTrack
      }
    } else {
      const idx = q.findIndex((t) => t.id === currentTrackId)
      if (idx >= 0 && idx + 1 < q.length) nextTrack = q[idx + 1]
    }

    if (nextTrack?.audioUrl) {
      const pre = new Audio()
      pre.preload = 'auto'
      pre.src = nextTrack.audioUrl
      pre.load()
      preloadRef.current = pre
      preloadedIdRef.current = nextTrack.id
    }
  }, [])

  const updateMediaSession = useCallback((track: Track) => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.albumTitle,
      artwork: track.albumArt
        ? [
            { src: track.albumArt, sizes: '512x512', type: 'image/jpeg' },
            { src: track.albumArt, sizes: '256x256', type: 'image/jpeg' },
          ]
        : [],
    })
  }, [])

  // Annuler le crossfade en cours et restaurer le volume
  const cancelCrossfade = useCallback(() => {
    if (crossfadeRafRef.current) {
      cancelAnimationFrame(crossfadeRafRef.current)
      crossfadeRafRef.current = null
    }
    // Arrêter et vider l'audio secondaire si crossfade était actif
    if (crossfadeActiveRef.current && preloadRef.current) {
      preloadRef.current.pause()
      preloadRef.current.src = ''
      preloadRef.current = null
      preloadedIdRef.current = null
      preloadedNextTrackRef.current = null
    }
    crossfadeActiveRef.current = false
    // Restaurer le volume de l'audio principal
    if (audioRef.current) audioRef.current.volume = volumeRef.current
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = savedSession?.volume ?? 0.7

    if (savedTrack?.audioUrl) {
      audio.src = savedTrack.audioUrl
      audio.load()
      audio.addEventListener('loadedmetadata', () => {
        if (savedSession && savedSession.currentTime > 0) {
          audio.currentTime = savedSession.currentTime
        }
      }, { once: true })
    }

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)

      // Déclencher le crossfade quand il reste CROSSFADE_DURATION secondes
      const remaining = audio.duration - audio.currentTime
      if (
        !isNaN(audio.duration) &&
        audio.duration > CROSSFADE_DURATION * 1.5 && // éviter les sons trop courts
        remaining > 0 &&
        remaining <= CROSSFADE_DURATION &&
        !crossfadeActiveRef.current &&
        isRepeatRef.current !== 'one' &&
        preloadRef.current &&
        preloadedIdRef.current
      ) {
        // Déterminer le prochain morceau
        const nextAudio = preloadRef.current
        const nextTrack = preloadedNextTrackRef.current
          ?? queueRef.current.find(t => t.id === preloadedIdRef.current)
          ?? null

        if (!nextTrack) return

        crossfadeActiveRef.current = true

        // Démarrer la lecture du prochain son à volume 0
        nextAudio.volume = 0
        nextAudio.play().catch(() => {})

        const userVol = volumeRef.current
        const startTime = performance.now()
        const totalMs = CROSSFADE_DURATION * 1000

        function tick(now: number) {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / totalMs, 1)

          // Fondu sortant : son actuel 1→0
          if (audioRef.current) audioRef.current.volume = userVol * (1 - progress)
          // Fondu entrant : prochain son 0→1
          nextAudio.volume = userVol * progress

          if (progress < 1) {
            crossfadeRafRef.current = requestAnimationFrame(tick)
          }
        }

        crossfadeRafRef.current = requestAnimationFrame(tick)
      }
    })

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))

    audio.addEventListener('ended', () => {
      // ── Fin en mode crossfade ────────────────────────────────────────
      if (crossfadeActiveRef.current) {
        if (crossfadeRafRef.current) {
          cancelAnimationFrame(crossfadeRafRef.current)
          crossfadeRafRef.current = null
        }
        crossfadeActiveRef.current = false

        const nextAudio = preloadRef.current
        const nextTrack = preloadedNextTrackRef.current
          ?? queueRef.current.find(t => t.id === preloadedIdRef.current)
          ?? null

        if (nextAudio && nextTrack) {
          // Transférer la source vers l'audio principal (déjà en cache → instantané)
          const resumeTime = nextAudio.currentTime
          nextAudio.pause()
          nextAudio.src = ''

          audio.src = nextTrack.audioUrl ?? ''
          audio.currentTime = resumeTime
          audio.volume = volumeRef.current
          audio.play().catch(() => {})

          preloadRef.current = null
          preloadedIdRef.current = null
          preloadedNextTrackRef.current = null

          setCurrentTrack(nextTrack)
          setCurrentTime(resumeTime)
          setIsPlaying(true)
          updateMediaSession(nextTrack)
          preloadNext(nextTrack.id, queueRef.current, isShuffleRef.current)
          setPlayCounts(prev => ({ ...prev, [nextTrack.id]: (prev[nextTrack.id] ?? 0) + 1 }))
          fetch('/api/play-counts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: nextTrack.id }),
          }).catch(() => {})
        } else {
          setIsPlaying(false)
          setCurrentTime(0)
        }
        return
      }

      // ── Fin normale (sans crossfade) ─────────────────────────────────
      const q = queueRef.current
      const cur = currentTrackRef.current
      const shuffle = isShuffleRef.current
      const repeat = isRepeatRef.current

      // repeat one → rejouer le même son
      if (repeat === 'one' && audio.src) {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }

      if (cur && q.length > 0) {
        const idx = q.findIndex((t) => t.id === cur.id)

        let nextTrack: Track | undefined
        if (preloadRef.current && preloadedIdRef.current) {
          nextTrack = shuffle
            ? (preloadedNextTrackRef.current ?? undefined)
            : q[idx + 1]
          if (!nextTrack) nextTrack = q.find((t) => t.id === preloadedIdRef.current) ?? q[idx + 1]
        } else {
          const nextIdx = shuffle
            ? Math.floor(Math.random() * q.length)
            : idx + 1
          nextTrack = nextIdx < q.length ? q[nextIdx] : undefined
        }

        // repeat all → boucler sur le premier titre si fin de file
        if (!nextTrack && repeat === 'all') {
          nextTrack = q[0]
        }

        if (nextTrack) {
          setCurrentTrack(nextTrack)
          setCurrentTime(0)
          if (nextTrack.audioUrl) {
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
          audio.volume = volumeRef.current
          setIsPlaying(true)
          updateMediaSession(nextTrack)
          preloadNext(nextTrack.id, q, shuffle)
          setPlayCounts((prev) => ({ ...prev, [nextTrack!.id]: (prev[nextTrack!.id] ?? 0) + 1 }))
          fetch('/api/play-counts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: nextTrack!.id }),
          }).catch(() => {})
        } else {
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

  // Sync volume — ne pas écraser pendant un crossfade actif
  useEffect(() => {
    volumeRef.current = volume
    if (audioRef.current && !crossfadeActiveRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [volume])

  useEffect(() => {
    if (!currentTrack) return
    saveSession({
      trackId: currentTrack.id,
      queueIds: queue.map(t => t.id),
      currentTime,
      volume,
      isShuffle,
      repeatMode,
    })
  }, [currentTrack, currentTime, queue, volume, isShuffle, repeatMode])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(() => {})
      setIsPlaying(true)
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      setIsPlaying(false)
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const q = queueRef.current
      const cur = currentTrackRef.current
      if (!cur || q.length === 0) return
      const idx = q.findIndex((t) => t.id === cur.id)
      const nextIdx = isShuffleRef.current
        ? Math.floor(Math.random() * q.length)
        : (idx + 1) % q.length
      const next = q[nextIdx]
      if (next) {
        const audio = audioRef.current
        if (!audio) return
        cancelCrossfade()
        setCurrentTrack(next)
        setCurrentTime(0)
        audio.src = next.audioUrl ?? ''
        audio.load()
        audio.play().catch(() => {})
        setIsPlaying(true)
        updateMediaSession(next)
      }
    })
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const audio = audioRef.current
      const q = queueRef.current
      const cur = currentTrackRef.current
      if (!cur || q.length === 0 || !audio) return
      if (audio.currentTime > 3) {
        audio.currentTime = 0
        setCurrentTime(0)
        return
      }
      const idx = q.findIndex((t) => t.id === cur.id)
      const prev = q[idx === 0 ? q.length - 1 : idx - 1]
      if (prev) {
        cancelCrossfade()
        setCurrentTrack(prev)
        setCurrentTime(0)
        audio.src = prev.audioUrl ?? ''
        audio.load()
        audio.play().catch(() => {})
        setIsPlaying(true)
        updateMediaSession(prev)
      }
    })
  }, [updateMediaSession, cancelCrossfade])

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current
    if (!audio) return

    // Annuler tout crossfade en cours avant de changer de son
    if (crossfadeRafRef.current) {
      cancelAnimationFrame(crossfadeRafRef.current)
      crossfadeRafRef.current = null
    }
    if (crossfadeActiveRef.current && preloadRef.current) {
      preloadRef.current.pause()
      preloadRef.current.src = ''
      preloadRef.current = null
      preloadedIdRef.current = null
      preloadedNextTrackRef.current = null
    }
    crossfadeActiveRef.current = false
    audio.volume = volumeRef.current

    setCurrentTrack(track)
    setCurrentTime(0)

    if (track.audioUrl) {
      audio.src = track.audioUrl
      audio.load()
      audio.play().catch(() => {})
    } else {
      setDuration(track.duration)
    }

    setIsPlaying(true)
    if (newQueue) setQueue(newQueue)

    updateMediaSession(track)
    preloadNext(track.id, newQueue ?? queueRef.current, isShuffleRef.current)

    setPlayCounts((prev) => ({ ...prev, [track.id]: (prev[track.id] ?? 0) + 1 }))
    fetch('/api/play-counts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: track.id }),
    }).catch(() => {})
  }, [updateMediaSession, preloadNext])

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
    volumeRef.current = clamped
    setVolumeState(clamped)
  }, [])

  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), [])
  const toggleRepeat = useCallback(() => setRepeatMode((r) => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'), [])

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
      repeatMode,
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