'use client'

import { useState } from 'react'
import { useAdmin } from '@/context/AdminContext'
import MaterialIcon from '@/components/ui/MaterialIcon'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AdminLoginModal({ open, onClose }: Props) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await login(password)
    setLoading(false)
    if (ok) {
      setPassword('')
      onClose()
    } else {
      setError('Mot de passe incorrect')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <MaterialIcon name="lock" className="text-primary text-2xl" />
          <h2 className="font-headline text-xl font-black uppercase tracking-tighter">
            Accès Admin
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
          />
          {error && (
            <p className="font-label text-xs text-error">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-outline-variant/20 font-headline font-bold uppercase tracking-widest text-sm text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!password || loading}
              className="flex-1 py-3 rounded-full bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? '...' : 'Entrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
