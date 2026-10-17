const CACHE_NAME = 're-late-v2';
// ... añade './paginas/...' si creas páginas locales
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return; // enlaces externos van directos a red
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
