'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useArtist } from '@/context/ArtistContext'
import { usePanel } from '@/context/PanelContext'
import { usePlayer } from '@/context/PlayerContext'
import LogoOwl from '@/components/ui/LogoOwl'

const NAV_ITEMS = [
  { label: 'Home',           icon: 'home_max',          href: '/'               },
  { label: 'Explorer',       icon: 'explore',           href: '/explore'        },
  { label: 'Tous les sons',  icon: 'queue_music',       href: '/songs'          },
  { label: 'Search',         icon: 'search',            href: '/search'         },
  { label: 'Library',        icon: 'album',             href: '/library'        },
  { label: 'Certifications', icon: 'workspace_premium', href: '/certifications' },
  { label: 'Studio',         icon: 'movie_edit',        href: '/studio'         },
  { label: 'Profile',        icon: 'person',            href: '/profile'        },
]

export default function SideNavigation() {
  const pathname = usePathname()
  const { profile } = useArtist()
  const { sidebarCollapsed, toggleSidebar, sidebarWidth } = usePanel()
  const { currentTrack } = usePlayer()

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 z-50 bg-surface-container-low border-r border-outline-variant/10 transition-[width] duration-300'
      )}
      style={{ 
        width: sidebarCollapsed ? '64px' : `${sidebarWidth}px`,
        bottom: currentTrack ? '96px' : '0px' 
      }}
      suppressHydrationWarning
    >
      {/* Logo / toggle */}
      <div className="flex items-center justify-between px-3 pt-6 pb-5 border-b border-outline-variant/10 min-h-[72px]">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <LogoOwl size={36} className="text-primary shrink-0" />
            <p className="font-headline font-black text-lg uppercase tracking-tighter text-primary leading-tight whitespace-nowrap">
              {profile.name}
            </p>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/" className="mx-auto">
            <LogoOwl size={32} className="text-primary" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all group',
                sidebarCollapsed ? 'justify-center px-0' : '',
                active
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent pl-2'
              )}
            >
              <span
                className="material-symbols-outlined text-[22px] shrink-0"
                style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <span className="font-label text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-outline-variant/10 space-y-1">
        <Link
          href="/download"
          title={sidebarCollapsed ? 'Download' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            sidebarCollapsed ? 'justify-center px-0' : '',
            pathname === '/download'
              ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent pl-2'
          )}
        >
          <span
            className="material-symbols-outlined text-[22px] shrink-0"
            style={pathname === '/download' ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
          >
            download
          </span>
          {!sidebarCollapsed && (
            <span className="font-label text-sm font-semibold uppercase tracking-wider">Download</span>
          )}
        </Link>

        {!sidebarCollapsed && (
          <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 pt-1">
            © 2026 OWL RECORDS
          </p>
        )}

        {/* Bouton toggle */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Développer' : 'Réduire'}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-all',
            sidebarCollapsed ? 'justify-center px-0' : ''
          )}
        >
          <MaterialIcon
            name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            className="text-xl shrink-0"
          />
          {!sidebarCollapsed && (
            <span className="font-label text-xs uppercase tracking-wider">Réduire</span>
          )}
        </button>
      </div>
    </aside>
  )
}