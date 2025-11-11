const CACHE_NAME = 'dharma-drum-v22';
const ASSETS = [
  'DharmaDrum_bak.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'images/Drum.jpeg',
  'images/Gong.jpeg',
  'images/Khanh.jpeg',
  'audio/tieng_mo_tram_loud.mp3',
  'audio/ChuongThayPhuocTinh.mp3',
  'audio/1_Khanh_23.2s.mp3',
  'audio/Khanh_Chap.mp3'
];

const LARGE_ASSETS = [
  'audio/tieng_mo_tram_loud_1s_3h.mp3',
  'audio/DHC_Truc_Lam_20s_20m.mp3',
  'audio/DHC_Truc_Lam_40s_20m.mp3',
  'audio/DHC_Truc_Lam_60s_20m.mp3',
  'audio/DHC_Truc_Lam_80s_20m.mp3',
  'audio/DHC_Truc_Lam_100s_20m.mp3',
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
        // fallback to cached root page ONLY for navigation
        if (event.request.mode === 'navigate') {
            return caches.match('DharmaDrum_bak.html');
        }
      });
    })
  );
});

// Listen for message to cache large assets
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_LARGE_ASSETS') {
    // Extend lifetime of SW to allow caching to complete
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Starting background download of large assets...');
        return cache.addAll(LARGE_ASSETS)
          .then(() => console.log('[SW] Large assets cached successfully'))
          .catch(err => console.error('[SW] Failed to cache large assets:', err));
      })
    );
  }
});
