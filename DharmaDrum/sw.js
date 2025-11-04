const CACHE_NAME = 'dharma-drum-v1';
const ASSETS = [
  './DharmaDrum.html',
  './',
  './images/Drum.jpeg',
  './images/Gong.jpeg',
  './images/Khanh.jpeg',
  './audio/tieng_mo_tram.mp3',
  './audio/ChuongThayPhuocTinh.mp3',
  './audio/1_Khanh_23.2s.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Put a copy in cache for future
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // ignore opaque responses (cross-origin) or errors
          if (response && response.status === 200) {
            cache.put(event.request, copy).catch(() => {});
          }
        });
        return response;
      }).catch(() => {
        // fallback to cached root page
        return caches.match('./DharmaDrum.html');
      });
    })
  );
});
