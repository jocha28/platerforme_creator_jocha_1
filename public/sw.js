const CACHE_NAME = 'jocha-v1'
const STATIC_ASSETS = [
  '/',
  '/profile',
  '/library',
  '/search',
  '/manifest.json',
  '/icon.svg',
]

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silent fail — certains assets peuvent ne pas exister encore
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les API routes et les fichiers audio
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/music/') ||
    request.method !== 'GET'
  ) {
    return
  }

  // Pour les covers (images) : cache first
  if (url.pathname.startsWith('/covers/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          return new Response('', { status: 408 })
        }
      })
    )
    return
  }

  // Pour tout le reste : network first, fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
