// Mandarijn Oefenapp – werkt ook offline
const CACHE = 'mandarijn-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/'))) {
    // pagina: eerst internet (voor updates), anders de bewaarde versie
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // rest (iconen, lettertypes): bewaarde versie, anders internet en bewaren
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque'){ const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); } return r; })));
});
