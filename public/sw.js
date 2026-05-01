const CACHE_NAME = 'jocha-pwa-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico',
]

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => console.log('Pre-cache error:', err))
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

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 1. Audio handling (Range requests)
  if (url.pathname.startsWith('/music/')) {
    event.respondWith(handleAudioRequest(request))
    return
  }

  // 2. API Init handling (Network First, then Cache)
  if (url.pathname === '/api/init') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // 3. Static Assets (Next.js chunks, images, etc.) - Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/covers/') ||
    url.pathname.startsWith('/fonts/') ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // 4. Default: Network First, Fallback to Cache (for pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match('/')) // Fallback to index if offline
    )
    return
  }
})

// Helper for Range requests (Audio)
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      // On ne met en cache que si c'est une réponse complète (200)
      // Fly.io peut envoyer du 206 (Partial Content), on évite de casser le cache avec ça
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (err) {
    return new Response('Offline: Audio not cached', { status: 503 })
  }
}
