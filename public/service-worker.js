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
      .catch(error => {
        console.error('Failed to cache:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Only handle HTTP/HTTPS requests.
  if (requestURL.protocol !== 'http:' && requestURL.protocol !== 'https:') {
    return fetch(event.request);
  }

  // For navigation requests (like refreshing the page), always serve index.html.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/routine-wonderful/index.html')
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request);
        })
        .catch(error => {
          console.error('Error fetching navigation request:', error);
          // Optionally, you can return a fallback page here.
        })
    );
    return;
  }
  
  // For all other requests, try the cache first, then the network.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
          // Only cache valid responses.
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
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
