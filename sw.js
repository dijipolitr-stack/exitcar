/* ExitCar Service Worker — PWA çevrimdışı + önbellek
 * Strateji:
 *  - HTML gezinme (navigate): network-first → cache → offline.html
 *  - Aynı origin statik (css/js/png/svg/font): stale-while-revalidate
 *  - Çapraz origin (CDN font/datepicker/araç görselleri): cache-first, sessiz başarısızlık
 * Sürümü artırınca eski önbellekler temizlenir. */
const VERSION = 'exitcar-v1';
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// Uygulama kabuğu — kurulumda önbelleğe alınır (tek tek, biri patlarsa diğeri devam)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/search.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/styles/main.css',
  '/styles/search.css',
  '/js/i18n.js',
  '/js/main.js',
  '/js/search.js',
  '/js/pwa.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML gezinme istekleri: network-first, çevrimdışında cache → offline.html
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offline = await caches.match('/offline.html');
        return offline || new Response('Çevrimdışı', { status: 503 });
      }
    })());
    return;
  }

  // Aynı origin statik varlıklar: stale-while-revalidate
  if (sameOrigin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((resp) => {
          if (resp && resp.status === 200) cache.put(request, resp.clone());
          return resp;
        })
        .catch(() => null);
      return cached || (await network) || new Response('', { status: 504 });
    })());
    return;
  }

  // Çapraz origin (CDN): cache-first, ağ varsa sessizce güncelle
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const resp = await fetch(request);
      if (resp && (resp.ok || resp.type === 'opaque')) cache.put(request, resp.clone());
      return resp;
    } catch (e) {
      return cached || new Response('', { status: 504 });
    }
  })());
});

// Sayfadan "hemen güncelle" mesajı gelirse bekleyen SW'yi devreye al
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
