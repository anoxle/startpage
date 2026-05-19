const CACHE_NAME = 'anoxle-startpage-v0.011-5b';
const SHELL_ASSETS = [
  './',
  './index.html',
  './app.js',
  './app.css'
];
SHELL_ASSETS.push('./icon.png', './manifest.json');

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      const stale = [];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== CACHE_NAME) stale.push(caches.delete(keys[i]));
      }
      return Promise.all(stale);
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', handleFetch);

function handleFetch(e) {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        });
      })
    );
  } else {
    e.respondWith(
      fetch(req).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
}
