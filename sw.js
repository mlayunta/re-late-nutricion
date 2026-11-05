/* ============================================================
   Re-Late · Service Worker
   Precarga el "shell" de la aplicación y permite el uso offline.
   El nombre de la caché es compatible con la limpieza que hace
   la propia app desde "Borrar todos los datos Re-Late".
   ============================================================ */

const VERSION = 'v3';

const SCOPE_URL = new URL('./', self.location.href).href;
const CACHE_NAME = 'relate-shell-' + encodeURIComponent(SCOPE_URL) + '-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifesto.json',
  './pwa-192.png',
  './pwa-512.png'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
  })());
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('relate-shell-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ---------- MENSAJES DESDE LA APP ---------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // No interceptar recursos de terceros (enlaces externos, PDFs, etc.)
  if (url.origin !== self.location.origin) return;

  // Navegación: red primero, caché como respaldo (offline)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./index.html')) ||
               (await cache.match('./')) ||
               Response.error();
      }
    })());
    return;
  }

  // Resto de recursos: caché primero, red como respaldo
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
