// CloudWatch APM Documentation Service Worker
// Provides offline support for critical documentation content

const CACHE_NAME = 'cloudwatch-apm-docs-v1'
const CRITICAL_URLS = [
  '/',
  '/getting-started',
  '/troubleshooting',
  '/api',
  '/configuration'
]

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching critical resources')
        return cache.addAll(CRITICAL_URLS)
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache resources', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response for caching
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/')
            }
          })
      })
  )
})

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CONTENT') {
    const { url, content } = event.data
    
    caches.open(CACHE_NAME)
      .then((cache) => {
        const response = new Response(content, {
          headers: { 'Content-Type': 'application/json' }
        })
        return cache.put(url, response)
      })
      .then(() => {
        event.ports[0].postMessage({ success: true })
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache content', error)
        event.ports[0].postMessage({ success: false, error: error.message })
      })
  }
})