'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAdmin } from '@/context/AdminContext'
import AdminLoginModal from '@/components/admin/AdminLoginModal'
import MaterialIcon from '@/components/ui/MaterialIcon'

interface AudioFile {
  name: string
  size: number
  url: string
}

interface UploadResult {
  name: string
  ok: boolean
  url?: string
  error?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function AdminAudioPage() {
  const { isAdmin } = useAdmin()
  const [loginOpen, setLoginOpen] = useState(false)
  const [files, setFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<UploadResult[]>([])
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/audio/list')
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadFiles()
  }, [isAdmin, loadFiles])

  async function handleUpload(selected: FileList | File[]) {
    const mp3s = Array.from(selected).filter(f => f.name.toLowerCase().endsWith('.mp3'))
    if (!mp3s.length) return

    setUploading(true)
    setResults([])

    // Upload par batch de 5 pour ne pas saturer
    const BATCH = 5
    const allResults: UploadResult[] = []

    for (let i = 0; i < mp3s.length; i += BATCH) {
      const batch = mp3s.slice(i, i + BATCH)
      const formData = new FormData()
      batch.forEach(f => formData.append('files', f))

      const res = await fetch('/api/audio/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        allResults.push(...(data.results ?? []))
      }
      setProgress(Math.round(((i + BATCH) / mp3s.length) * 100))
    }

    setResults(allResults)
    setUploading(false)
    setProgress(0)
    loadFiles()
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files)
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-40 flex flex-col items-center justify-center gap-6">
        <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <MaterialIcon name="lock" className="text-primary text-5xl" />
        <p className="font-headline text-xl font-black uppercase tracking-tighter">Accès restreint</p>
        <button
          onClick={() => setLoginOpen(true)}
          className="px-8 py-3 bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm rounded-full hover:brightness-110 transition-all"
        >
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-40 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Admin</p>
        <h1 className="font-headline text-4xl font-black tracking-tighter uppercase">
          Gérer les MP3
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          {files.length} fichier{files.length !== 1 ? 's' : ''} hébergé{files.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 mb-8 text-center cursor-pointer transition-all
          ${dragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high'}
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".mp3"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
        <MaterialIcon name="upload_file" className="text-primary text-5xl mb-3" />
        <p className="font-headline text-lg font-bold">Glisse tes MP3 ici</p>
        <p className="font-label text-sm text-on-surface-variant mt-1">ou clique pour sélectionner</p>
        <p className="font-label text-[10px] text-on-surface-variant/50 mt-3 uppercase tracking-widest">
          Plusieurs fichiers acceptés
        </p>
      </div>

      {/* Barre de progression */}
      {uploading && (
        <div className="mb-8 bg-surface-container-high rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-label text-sm font-bold uppercase tracking-widest">Upload en cours…</p>
            <span className="font-headline text-primary font-black">{progress}%</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Résultats d'upload */}
      {results.length > 0 && (
        <div className="mb-8 bg-surface-container-high rounded-2xl p-6 space-y-2">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
            Résultats — {results.filter(r => r.ok).length}/{results.length} réussis
          </p>
          {results.map(r => (
            <div key={r.name} className="flex items-center gap-3">
              <MaterialIcon
                name={r.ok ? 'check_circle' : 'error'}
                className={r.ok ? 'text-primary text-lg' : 'text-error text-lg'}
              />
              <span className="font-label text-sm truncate flex-1">{r.name}</span>
              {r.error && <span className="font-label text-xs text-error">{r.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Liste des fichiers */}
      <div className="bg-surface-container-high rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 flex items-center gap-3">
          <MaterialIcon name="search" className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un fichier…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
          />
          {loading && <MaterialIcon name="refresh" className="text-primary animate-spin" />}
        </div>

        <div className="divide-y divide-outline-variant/10 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant opacity-40">
              <MaterialIcon name="music_off" className="text-4xl mb-2" />
              <p className="font-label text-sm uppercase tracking-widest">Aucun fichier</p>
            </div>
          ) : (
            filtered.map(file => (
              <div key={file.name} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-container transition-colors">
                <MaterialIcon name="audio_file" className="text-primary shrink-0" />
                <span className="flex-1 font-label text-sm truncate">{file.name}</span>
                <span className="font-label text-[10px] text-on-surface-variant shrink-0">{formatSize(file.size)}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  title="Écouter"
                >
                  <MaterialIcon name="play_circle" className="text-xl" />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
