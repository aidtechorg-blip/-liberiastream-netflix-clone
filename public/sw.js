// Minimal service worker for installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optional: network-first for navigation requests (fallback to offline page if added)
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests simply to keep SW alive
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
  }
});
