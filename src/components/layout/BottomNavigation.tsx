'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home',   icon: 'home_max',          href: '/'               },
  { label: 'Search', icon: 'search',             href: '/search'         },
  { label: 'Certifs',icon: 'workspace_premium',  href: '/certifications' },
  { label: 'Library',icon: 'album',              href: '/library'        },
  { label: 'Profile',icon: 'person',             href: '/profile'        },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface-container-low/60 backdrop-blur-3xl flex justify-around items-center h-20 shadow-[0_-4px_40px_rgba(0,0,0,0.5)]">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all',
              active
                ? 'text-primary drop-shadow-[0_0_8px_rgba(182,160,255,0.4)] scale-110'
                : 'text-on-surface/50 hover:text-primary'
            )}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest font-semibold">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
