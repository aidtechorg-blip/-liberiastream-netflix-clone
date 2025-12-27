/* LiberiaStream Service Worker (offline-capable)
   Strategy:
   - App shell: network-first for navigations with offline fallback
   - Static assets (icons, manifest, offline page): cache-first
   - Images: stale-while-revalidate
*/
const VERSION = new URL(self.location.href).searchParams.get('v') || 'v-dev';
const STATIC_CACHE = `ls-static-${VERSION}`;
const RUNTIME_CACHE = `ls-runtime-${VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/liberiastream_icon_192.png',
  '/icons/liberiastream_icon_256.png',
  '/icons/liberiastream_icon_384.png',
  '/icons/liberiastream_icon_512.png',
  '/icons/liberiastream_icon_512_maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // App navigation: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        return cache.match('/offline.html') || Response.error();
      })
    );
    return;
  }

  const url = new URL(request.url);

  // Cache-first for static assets we know
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        return resp;
      }))
    );
    return;
  }

  // Images: stale-while-revalidate
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((resp) => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
