'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useArtist } from '@/context/ArtistContext'
import LogoOwl from '@/components/ui/LogoOwl'

const NAV_ITEMS = [
  { label: 'Home', icon: 'home_max', href: '/' },
  { label: 'Search', icon: 'search', href: '/search' },
  { label: 'Library', icon: 'album', href: '/library' },
  { label: 'Profile', icon: 'person', href: '/profile' },
]

export default function SideNavigation() {
  const pathname = usePathname()
  const { profile } = useArtist()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-50 bg-surface-container-low border-r border-outline-variant/10">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-outline-variant/10">
        <Link href="/" className="flex items-center gap-3">
          <LogoOwl size={40} className="text-primary shrink-0" />
          <p className="font-headline font-black text-xl uppercase tracking-tighter text-primary leading-tight">
            {profile.name}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all group',
                active
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent pl-2'
              )}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label text-sm font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-outline-variant/10 space-y-1">
        <Link
          href="/download"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            pathname === '/download'
              ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent pl-2'
          )}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={pathname === '/download' ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
          >
            download
          </span>
          <span className="font-label text-sm font-semibold uppercase tracking-wider">
            Download
          </span>
        </Link>
        <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 pt-2">
          © 2026 OWL RECORDS
        </p>
      </div>
    </aside>
  )
}
