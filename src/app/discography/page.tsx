'use client'

import { useState, useMemo } from 'react'
import { MOCK_RELEASES } from '@/data/releases'
import { TabId } from '@/types'
import ReleaseCard from '@/components/discography/ReleaseCard'
import Chip from '@/components/ui/Chip'
import MaterialIcon from '@/components/ui/MaterialIcon'

const TABS: { id: TabId; label: string }[] = [
  { id: 'latest', label: 'Latest Releases' },
  { id: 'albums', label: 'Albums' },
  { id: 'mixtapes', label: 'Mixtapes' },
  { id: 'eps', label: 'EPs' },
  { id: 'singles', label: 'Singles' },
]

export default function DiscographyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('latest')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = MOCK_RELEASES
    if (activeTab !== 'latest') {
      const typeMap: Record<string, string> = { albums: 'album', mixtapes: 'mixtape', eps: 'ep', singles: 'single' }
      list = list.filter((r) => r.type === typeMap[activeTab])
    }
    if (search.trim()) {
      list = list.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
    }
    return list
  }, [activeTab, search])

  const featured = filtered[0]
  const secondary = filtered[1]
  const rest = filtered.slice(2)

  return (
    <div className="pt-24 pb-40 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">
              Archive 01
            </span>
            <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none text-on-background">
              DISCOGRAPHY
            </h2>
            <p className="mt-6 text-on-surface-variant font-body text-lg leading-relaxed opacity-80">
              A curated collection of sonic landscapes, from early experimental singles to full-length editorial resonances.
            </p>
          </div>
          {/* Search */}
          <div className="w-full md:w-80 group">
            <div className="relative flex items-center">
              <MaterialIcon
                name="search"
                className="absolute left-4 text-on-surface-variant group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="FIND A RELEASE..."
                className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 font-label text-xs tracking-widest uppercase focus:ring-2 focus:ring-primary/20 placeholder:text-outline/60 transition-all outline-none text-on-surface"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="mb-12 overflow-x-auto no-scrollbar">
        <div className="flex gap-8 border-b border-outline-variant/10 pb-0 min-w-max">
          {TABS.map((tab) => (
            <Chip
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </nav>

      {/* Bento Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <MaterialIcon name="search_off" size="xl" className="mb-4 opacity-40" />
          <p className="font-label uppercase tracking-widest">Aucun résultat</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {featured && (
            <div className="md:col-span-8">
              <ReleaseCard album={featured} variant="featured" priority />
            </div>
          )}
          {secondary && (
            <div className="md:col-span-4">
              <ReleaseCard album={secondary} variant="square" />
            </div>
          )}
          {rest.map((album) => (
            <div key={album.id} className="md:col-span-3">
              <ReleaseCard album={album} variant="small" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
