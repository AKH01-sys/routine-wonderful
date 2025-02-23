const CACHE_NAME = 'day-off-cache-v1';
const urlsToCache = [
  '/routine-wonderful/',
  '/routine-wonderful/index.html',
  '/routine-wonderful/manifest.json',
  '/routine-wonderful/favicon.ico',
  '/routine-wonderful/og-image.png',
  '/routine-wonderful/placeholder.svg',
  '/routine-wonderful/lovable-uploads/89a650a8-5904-4b2d-813a-b1c664fb2d78.png',

  // Manually add build files
  '/routine-wonderful/assets/index-g2vRfnP6.js',
  '/routine-wonderful/assets/index-Bi3fIB4b.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            !event.request.url.startsWith('chrome-extension') &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});
