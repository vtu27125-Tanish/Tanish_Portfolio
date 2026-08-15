const CACHE_NAME = 'tanish-console-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/offline.html',
  '/og-image.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for web pages/assets
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful asset responses
        if (response.status === 200 && event.request.url.startsWith('http')) {
          const resClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone))
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedRes) => {
          if (cachedRes) return cachedRes
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
      })
  )
})
