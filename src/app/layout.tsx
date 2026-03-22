import type { Metadata } from 'next'
import { Epilogue, Manrope } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import { ArtistProvider } from '@/context/ArtistContext'
import { PlaylistProvider } from '@/context/PlaylistContext'
import { AdminProvider } from '@/context/AdminContext'
import AppShell from '@/components/layout/AppShell'
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar'

const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  weight: ['400', '500', '700', '800', '900'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Jocha Official',
  description: 'Plateforme musicale officielle de Jocha',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jocha',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#E8B800',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${epilogue.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Jocha" />
        <meta name="theme-color" content="#E8B800" />
        <meta name="msapplication-TileColor" content="#0F0D0A" />
      </head>
      <body className="bg-background text-on-background font-body antialiased selection:bg-primary/30 overflow-x-hidden">
        <ServiceWorkerRegistrar />
        <AdminProvider>
          <ArtistProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <AppShell>
                  {children}
                </AppShell>
              </PlaylistProvider>
            </PlayerProvider>
          </ArtistProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
