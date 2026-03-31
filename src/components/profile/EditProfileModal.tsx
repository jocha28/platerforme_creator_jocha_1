'use client'

import { useEffect, useRef, useState } from 'react'
import { useArtist, ArtistProfile } from '@/context/ArtistContext'
import { MOCK_RELEASES } from '@/data/releases'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { profile, updateProfile } = useArtist()

  const [form, setForm] = useState<ArtistProfile>(profile)
  const [genreInput, setGenreInput] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const pickBgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(profile)
      setGenreInput('')
    }
  }, [open, profile])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  function set<K extends keyof ArtistProfile>(key: K, value: ArtistProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function uploadImage(file: File, field: string): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('field', field)
    try {
      const res = await fetch('/api/profile/upload', { method: 'POST', body: fd })
      if (!res.ok) return null
      const { url } = await res.json()
      return url as string
    } catch {
      return null
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const url = await uploadImage(file, 'avatar')
    if (url) set('avatar', url)
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const url = await uploadImage(file, 'coverPhoto')
    if (url) set('coverPhoto', url)
  }

  async function handlePickBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const url = await uploadImage(file, 'artistPickBackground')
    if (url) setPickField('backgroundPhoto', url)
  }

  function setPickField<K extends keyof NonNullable<ArtistProfile['artistPick']>>(
    key: K,
    value: NonNullable<ArtistProfile['artistPick']>[K]
  ) {
    setForm((f) => ({
      ...f,
      artistPick: { releaseSlug: '', backgroundPhoto: '', description: '', ...f.artistPick, [key]: value },
    }))
  }

  function addGenre() {
    const tag = genreInput.trim()
    if (tag && !form.genres.includes(tag)) {
      set('genres', [...form.genres, tag])
    }
    setGenreInput('')
  }

  function removeGenre(tag: string) {
    set('genres', form.genres.filter((g) => g !== tag))
  }

  function handleGenreKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addGenre()
    }
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full lg:max-w-2xl max-h-[92dvh] lg:max-h-[85vh] flex flex-col bg-surface-container rounded-t-3xl lg:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline text-xl font-black tracking-tight">Modifier le profil</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-6">

          {/* Photo de couverture */}
          <div>
            <span className={labelClass}>Photo de couverture</span>
            <div
              className="relative mt-1.5 h-32 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20 cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {form.coverPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant/40">
                  <MaterialIcon name="panorama" className="text-3xl" />
                  <span className="font-label text-xs uppercase tracking-wider">Ajouter une couverture</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full font-label text-xs font-bold uppercase tracking-wider text-on-background">
                  <MaterialIcon name="upload" className="text-sm" />
                  Modifier
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </div>
            {form.coverPhoto && (
              <button
                onClick={() => set('coverPhoto', '')}
                className="mt-2 flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label text-[10px] uppercase tracking-wider transition-colors"
              >
                <MaterialIcon name="delete" className="text-sm" />
                Supprimer la couverture
              </button>
            )}
          </div>

          {/* Photo de profil */}
          <div>
            <span className={labelClass}>Photo de profil</span>
            <div className="flex items-center gap-5 mt-1.5">
              {/* Preview */}
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-primary/30 bg-surface-container-high relative">
                {form.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatar} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon name="person" className="text-on-surface-variant/40 text-3xl" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-label text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all active:scale-95"
                >
                  <MaterialIcon name="upload" className="text-sm" />
                  Importer une photo
                </button>
                {form.avatar && (
                  <button
                    onClick={() => set('avatar', '')}
                    className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-on-surface font-label text-xs uppercase tracking-wider transition-colors"
                  >
                    <MaterialIcon name="delete" className="text-sm" />
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant/50 mt-2">JPG, PNG, WEBP — max 5 Mo</p>
          </div>

          {/* Nom */}
          <div>
            <label className={labelClass}>Nom d'artiste</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Bio */}
          <div>
            <label className={labelClass}>Biographie</label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={4}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {/* Localisation + Site web */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Localisation</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Paris, France"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Site web</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </div>
          </div>

          {/* Actif depuis */}
          <div>
            <label className={labelClass}>Actif depuis</label>
            <input
              type="text"
              value={form.yearsActive}
              onChange={(e) => set('yearsActive', e.target.value)}
              placeholder="2021"
              className={inputClass}
            />
          </div>

          {/* Genres */}
          <div>
            <label className={labelClass}>Genres</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.genres.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-primary/15 rounded-full font-label text-xs text-primary"
                >
                  {tag}
                  <button onClick={() => removeGenre(tag)} className="hover:text-on-background transition-colors">
                    <MaterialIcon name="close" className="text-sm" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={handleGenreKeyDown}
                placeholder="Ajouter un genre…"
                className={cn(inputClass, 'flex-1')}
              />
              <button
                onClick={addGenre}
                disabled={!genreInput.trim()}
                className="px-4 py-2.5 bg-primary/20 text-primary rounded-xl font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant/50 mt-2">Entrée ou virgule pour valider</p>
          </div>

          {/* ── Artist Pick ── */}
          <div className="border-t border-outline-variant/10 pt-6">
            <p className={cn(labelClass, 'mb-3 text-primary')}>Artist Pick — Mise en avant</p>

            {/* Sortie à mettre en avant */}
            <div className="mb-4">
              <label className={labelClass}>Sortie à mettre en avant</label>
              <select
                value={form.artistPick?.releaseSlug ?? ''}
                onChange={(e) => setPickField('releaseSlug', e.target.value)}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value="">— Aucune —</option>
                {MOCK_RELEASES.filter((r) => r.type !== 'single').map((r) => (
                  <option key={r.id} value={r.slug}>{r.title} ({r.year})</option>
                ))}
              </select>
            </div>

            {/* Photo de fond */}
            <div className="mb-4">
              <span className={labelClass}>Photo d'arrière-plan</span>
              <div
                className="relative mt-1.5 h-28 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20 cursor-pointer group"
                onClick={() => pickBgInputRef.current?.click()}
              >
                {form.artistPick?.backgroundPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.artistPick.backgroundPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant/40">
                    <MaterialIcon name="image" className="text-3xl" />
                    <span className="font-label text-xs uppercase tracking-wider">Ajouter une photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full font-label text-xs font-bold uppercase tracking-wider text-on-background">
                    <MaterialIcon name="upload" className="text-sm" />
                    Modifier
                  </div>
                </div>
                <input ref={pickBgInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickBgChange} />
              </div>
              {form.artistPick?.backgroundPhoto && (
                <button
                  onClick={() => setPickField('backgroundPhoto', '')}
                  className="mt-2 flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label text-[10px] uppercase tracking-wider transition-colors"
                >
                  <MaterialIcon name="delete" className="text-sm" />
                  Supprimer la photo
                </button>
              )}
            </div>

            {/* Message / annonce */}
            <div>
              <label className={labelClass}>Message / Annonce</label>
              <textarea
                value={form.artistPick?.description ?? ''}
                onChange={(e) => setPickField('description', e.target.value)}
                rows={3}
                placeholder="Nouvel album disponible maintenant ! Découvrez…"
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-outline-variant/10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-outline-variant/30 font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelClass = 'block font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5'
const inputClass = 'w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors font-body'
