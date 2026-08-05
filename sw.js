const CACHE_NAME = 'anoxle-startpage-v1785924473740';
const SHELL_ASSETS = ["./","./index.html","./assets/app.js","./assets/app.css"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method!== 'GET' || url.pathname.includes('sw.js')) return;

  if (url.pathname.includes('/assets/fonts/') || req.destination === 'font') {
    e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, clone)); }
      return res;
    })));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, clone)); return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, clone)); }
      return res;
    })));
  }
});
