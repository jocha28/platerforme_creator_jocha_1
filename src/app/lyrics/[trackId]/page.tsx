'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { JOCHA_TRACKS } from '@/data/tracks'
import { MOCK_RELEASES } from '@/data/releases'
import { getLyrics, getCurrentLineIndex } from '@/data/lyrics'
import { usePlayer } from '@/context/PlayerContext'
import { useAdmin } from '@/context/AdminContext'
import { formatPlays, getSingleCertification, cn } from '@/lib/utils'
import CertificationDisc from '@/components/ui/CertificationDisc'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { Annotation } from '@/types'

/* ─── Types locaux ─── */
interface SelectionInfo {
  lineIndex: number
  selectedText: string
  anchorY: number
}

/* ─── Helper : rend une ligne avec ses passages annotés surlignés ─── */
function AnnotatedLine({
  text,
  lineAnnotations,
  onClickAnn,
}: {
  text: string
  lineAnnotations: Annotation[]
  onClickAnn: (ann: Annotation) => void
}) {
  if (lineAnnotations.length === 0) return <>{text}</>

  const parts: { text: string; ann?: Annotation }[] = []
  let remaining = text
  const sorted = [...lineAnnotations].sort(
    (a, b) => remaining.indexOf(a.selectedText) - remaining.indexOf(b.selectedText)
  )
  for (const ann of sorted) {
    const idx = remaining.indexOf(ann.selectedText)
    if (idx === -1) continue
    if (idx > 0) parts.push({ text: remaining.slice(0, idx) })
    parts.push({ text: ann.selectedText, ann })
    remaining = remaining.slice(idx + ann.selectedText.length)
  }
  if (remaining) parts.push({ text: remaining })
  if (parts.length === 0) return <>{text}</>

  return (
    <>
      {parts.map((p, i) =>
        p.ann ? (
          <mark
            key={i}
            onClick={(e) => { e.stopPropagation(); onClickAnn(p.ann!) }}
            className="bg-yellow-400/20 text-yellow-300 border-b-2 border-yellow-400/60 cursor-pointer hover:bg-yellow-400/35 transition-colors rounded-sm px-0.5 not-italic"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

/* ════════════════════════════════════════════════ */

export default function LyricsPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const track  = JOCHA_TRACKS.find((t) => t.id === trackId)
  const lyrics = getLyrics(trackId) ?? []

  const { play, currentTrack, isPlaying, currentTime, playCounts } = usePlayer()
  const { isAdmin } = useAdmin()

  /* État */
  const [annotations, setAnnotations]       = useState<Annotation[]>([])
  const [activeAnn, setActiveAnn]           = useState<Annotation | null>(null)   // annotation affichée à droite
  const [selection, setSelection]           = useState<SelectionInfo | null>(null) // sélection en cours
  const [annotationBody, setAnnotationBody] = useState('')
  const [saving, setSaving]                 = useState(false)
  const [activeLineIdx, setActiveLineIdx]   = useState(-1)
  const [panelMode, setPanelMode]           = useState<'view' | 'create'>('view')

  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  const isCurrent = currentTrack?.id === trackId

  /* Ligne active en lecture */
  useEffect(() => {
    if (!isCurrent) return
    const idx = getCurrentLineIndex(lyrics, currentTime)
    setActiveLineIdx(idx)
    // Auto-scroll vers la ligne active
    const el = document.getElementById(`line-${idx}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentTime, isCurrent, lyrics])

  /* Charger annotations */
  useEffect(() => {
    fetch(`/api/annotations/${trackId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setAnnotations)
      .catch(() => {})
  }, [trackId])

  /* Grouper annotations par ligne */
  const annsByLine = annotations.reduce<Record<number, Annotation[]>>((acc, a) => {
    acc[a.lineIndex] = [...(acc[a.lineIndex] ?? []), a]
    return acc
  }, {})

  /* Gestion sélection de texte */
  function handleLineMouseUp(lineIdx: number, e: React.MouseEvent) {
    if (!isAdmin) return
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (!text || text.length < 2) return
    setSelection({ lineIndex: lineIdx, selectedText: text, anchorY: e.clientY })
    setAnnotationBody('')
    setActiveAnn(null)
    setPanelMode('create')
  }

  /* Clic sur une annotation */
  function handleClickAnnotation(ann: Annotation) {
    setActiveAnn(ann)
    setPanelMode('view')
    setSelection(null)
    setAnnotationBody('')
  }

  /* Sauvegarder */
  async function saveAnnotation() {
    if (!selection || !annotationBody.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/annotations/${trackId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineIndex: selection.lineIndex,
          selectedText: selection.selectedText,
          annotationBody,
          author: 'Jocha',
        }),
      })
      if (res.ok) {
        const created: Annotation = await res.json()
        setAnnotations((prev) => [...prev, created])
        setActiveAnn(created)
        setPanelMode('view')
        setSelection(null)
        setAnnotationBody('')
        window.getSelection()?.removeAllRanges()
      }
    } finally {
      setSaving(false)
    }
  }

  /* Supprimer */
  async function deleteAnnotation(id: string) {
    await fetch(`/api/annotations/${trackId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    setActiveAnn(null)
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant pt-16">
        Titre introuvable.
      </div>
    )
  }

  const plays = playCounts[track.id] ?? 0
  const cert  = getSingleCertification(plays)
  const panelOpen = !!(activeAnn || selection)

  return (
    <div className="min-h-screen pt-16 flex flex-col">

      {/* ══════════════════════════════════════
          HERO — fond ambiant + cover + infos
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden shrink-0">
        {/* Fond cover flouté */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image src={track.albumArt} alt="" fill className="object-cover blur-2xl scale-110 opacity-30" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative z-10 flex items-end gap-6 md:gap-10 px-6 md:px-12 pt-8 pb-8 max-w-6xl mx-auto w-full">
          {/* Cover */}
          <Link href={`/album/${MOCK_RELEASES.find(r => track.albumId === 'singles' ? r.id === track.id : r.id === track.albumId)?.slug || (track.albumId === 'singles' ? '' : track.albumId)}`} className="shrink-0 group hidden sm:block">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 group-hover:shadow-primary/20 transition-shadow">
              <Image src={track.albumArt} alt={track.albumTitle} width={144} height={144} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
            </div>
          </Link>

          {/* Infos titre */}
          <div className="flex-1 min-w-0 pb-1">
            <p className="font-label text-[10px] uppercase tracking-[0.35em] text-primary mb-1.5 flex items-center gap-2">
              <MaterialIcon name="lyrics" className="text-sm" />
              Paroles
            </p>
            <h1 className="font-headline font-black uppercase tracking-tighter text-on-background leading-none mb-1"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}>
              {track.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
              <Link href={`/album/${MOCK_RELEASES.find(r => track.albumId === 'singles' ? r.id === track.id : r.id === track.albumId)?.slug || (track.albumId === 'singles' ? '' : track.albumId)}`} className="font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
                {track.albumTitle}
              </Link>
              <span className="text-on-surface-variant/30">·</span>
              <span className="font-label text-sm text-on-surface-variant/60 flex items-center gap-1">
                <MaterialIcon name="headphones" className="text-xs" />
                {formatPlays(plays)}
              </span>
              {cert && (
                <>
                  <span className="text-on-surface-variant/30">·</span>
                  <span className="flex items-center gap-1.5">
                    <CertificationDisc type={cert.disc} size={16} />
                    <span className={`font-label text-[10px] uppercase tracking-wider font-bold ${cert.color}`}>
                      Disque de {cert.label}
                    </span>
                  </span>
                </>
              )}
              {annotations.length > 0 && (
                <>
                  <span className="text-on-surface-variant/30">·</span>
                  <span className="font-label text-[10px] text-primary/70 flex items-center gap-1">
                    <MaterialIcon name="sticky_note_2" className="text-xs" />
                    {annotations.length} annotation{annotations.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => play(track, JOCHA_TRACKS)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-full font-label text-xs font-bold uppercase tracking-widest transition-all active:scale-95',
                  isCurrent && isPlaying
                    ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
                    : 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110'
                )}
              >
                <MaterialIcon name={isCurrent && isPlaying ? 'pause' : 'play_arrow'} filled />
                {isCurrent && isPlaying ? 'En lecture' : 'Écouter'}
              </button>
              {isAdmin && (
                <span className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/10 border border-yellow-500/25 rounded-full font-label text-[10px] uppercase tracking-wider text-yellow-400">
                  <MaterialIcon name="edit" className="text-xs" />
                  Mode admin · Sélectionne pour annoter
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CORPS — paroles (gauche) + panneau (droite)
      ══════════════════════════════════════ */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-6 md:px-12 gap-8 pb-32">

        {/* ── Paroles ── */}
        <div ref={lyricsContainerRef} className="flex-1 min-w-0 py-8">
          {lyrics.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3 text-on-surface-variant">
              <MaterialIcon name="lyrics" className="text-5xl opacity-20" />
              <p className="font-label text-sm uppercase tracking-wider opacity-50">Paroles non disponibles</p>
            </div>
          ) : (
            <div className="space-y-0">
              {lyrics.map((line, lineIdx) => {
                const lineAnns  = annsByLine[lineIdx] ?? []
                const isEmpty   = !line.text.trim()
                const isActive  = isCurrent && lineIdx === activeLineIdx
                const hasAnns   = lineAnns.length > 0

                if (isEmpty) return <div key={lineIdx} className="h-6" />

                return (
                  <div
                    id={`line-${lineIdx}`}
                    key={lineIdx}
                    className={cn(
                      'group relative flex items-start gap-3 py-1 rounded-xl transition-all duration-200',
                      isAdmin && 'cursor-text hover:bg-white/5 px-3 -mx-3',
                      !isAdmin && hasAnns && 'cursor-pointer px-3 -mx-3 hover:bg-white/5',
                    )}
                    onMouseUp={(e) => handleLineMouseUp(lineIdx, e)}
                    onClick={() => {
                      if (!isAdmin && hasAnns) handleClickAnnotation(lineAnns[0])
                    }}
                  >
                    {/* Indicateur annotation */}
                    <div className={cn(
                      'shrink-0 mt-1.5 w-1 self-stretch rounded-full transition-all',
                      hasAnns ? 'bg-yellow-400/70' : 'bg-transparent',
                      isActive && !hasAnns && 'bg-primary/40',
                    )} />

                    {/* Texte */}
                    <p className={cn(
                      'flex-1 font-headline font-bold leading-snug select-text transition-all duration-200',
                      isActive
                        ? 'text-primary text-2xl md:text-3xl'
                        : 'text-on-background/75 hover:text-on-background text-xl md:text-2xl',
                    )}>
                      <AnnotatedLine
                        text={line.text}
                        lineAnnotations={lineAnns}
                        onClickAnn={handleClickAnnotation}
                      />
                    </p>

                    {/* Badge nb annotations */}
                    {hasAnns && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClickAnnotation(lineAnns[0]) }}
                        className="shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 hover:bg-yellow-500/30 border border-yellow-500/20"
                      >
                        <MaterialIcon name="sticky_note_2" className="text-yellow-400 text-xs" />
                        <span className="font-label text-[10px] text-yellow-400 font-bold">{lineAnns.length}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Panneau annotation (droite) ── */}
        <div className={cn(
          'shrink-0 transition-all duration-300 overflow-hidden',
          panelOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none',
        )}>
          <div className="w-80 sticky top-24 pt-8">

            {/* ── Vue annotation ── */}
            {panelMode === 'view' && activeAnn && (() => {
              const lineAnns = annsByLine[activeAnn.lineIndex] ?? []
              return (
                <div className="bg-surface-container-high rounded-2xl overflow-hidden border border-outline-variant/15 shadow-xl">
                  {/* Passage surligné */}
                  <div className="px-5 py-4 bg-yellow-500/8 border-b border-yellow-500/15">
                    <p className="font-label text-[9px] uppercase tracking-widest text-yellow-400/70 mb-2">Passage annoté</p>
                    <p className="font-headline font-bold text-base text-on-background italic leading-snug">
                      « {activeAnn.selectedText} »
                    </p>
                  </div>

                  {/* Toutes les annotations de cette ligne */}
                  <div className="divide-y divide-outline-variant/10">
                    {lineAnns.map((ann) => (
                      <div key={ann.id} className="px-5 py-4">
                        <p className="font-body text-sm text-on-surface leading-relaxed">{ann.body}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                              <span className="font-label text-[9px] font-black text-on-primary">{ann.author[0]}</span>
                            </div>
                            <span className="font-label text-[10px] text-on-surface-variant">{ann.author}</span>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => deleteAnnotation(ann.id)}
                              className="text-error/40 hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                              title="Supprimer"
                            >
                              <MaterialIcon name="delete" className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-outline-variant/10 flex justify-between items-center">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelection({ lineIndex: activeAnn.lineIndex, selectedText: activeAnn.selectedText, anchorY: 0 })
                          setPanelMode('create')
                          setActiveAnn(null)
                        }}
                        className="font-label text-[10px] uppercase tracking-wider text-primary hover:brightness-125 transition-all flex items-center gap-1"
                      >
                        <MaterialIcon name="add" className="text-xs" /> Ajouter
                      </button>
                    )}
                    <button
                      onClick={() => { setActiveAnn(null) }}
                      className="ml-auto font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── Créer annotation ── */}
            {panelMode === 'create' && selection && isAdmin && (
              <div className="bg-surface-container-high rounded-2xl overflow-hidden border border-outline-variant/15 shadow-xl">
                {/* Passage sélectionné */}
                <div className="px-5 py-4 bg-primary/8 border-b border-primary/15">
                  <p className="font-label text-[9px] uppercase tracking-widest text-primary/70 mb-2">Annoter ce passage</p>
                  <p className="font-headline font-bold text-base text-on-background italic leading-snug line-clamp-3">
                    « {selection.selectedText} »
                  </p>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <textarea
                    autoFocus
                    placeholder="Explique le sens, le contexte, les références…"
                    value={annotationBody}
                    onChange={(e) => setAnnotationBody(e.target.value)}
                    rows={5}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/35 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                  />

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => { setSelection(null); setPanelMode('view'); window.getSelection()?.removeAllRanges() }}
                      className="px-4 py-2 font-label text-xs uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors rounded-xl hover:bg-surface-container"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={saveAnnotation}
                      disabled={!annotationBody.trim() || saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-primary/20"
                    >
                      {saving
                        ? <MaterialIcon name="hourglass_empty" className="text-sm animate-spin" />
                        : <MaterialIcon name="check" className="text-sm" />
                      }
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}