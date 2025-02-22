// A simple service worker that caches your core files
const CACHE_NAME = 'day-off-cache-v1';

// Add all files you need to make the app work offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.png',
  '/placeholder.svg',
  '/lovable-uploads/89a650a8-5904-4b2d-813a-b1c664fb2d78.png',
  // If you want to cache your main.tsx or its compiled output, add it here:
  '/src/main.tsx'
  // Add any other JS/CSS build files if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return the cached response if present
      if (response) {
        return response;
      }
      // Otherwise, fetch from the network
      return fetch(event.request).then(networkResponse => {
        // Check if the response is valid
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          // Clone and store it in the cache
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
