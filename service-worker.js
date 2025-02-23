const CACHE_NAME = 'day-off-cache-v1';
const urlsToCache = [
  '/routine-wonderful/',
  '/routine-wonderful/index.html',
  '/routine-wonderful/manifest.json',
  '/routine-wonderful/favicon.ico',
  '/routine-wonderful/og-image.png',
  '/routine-wonderful/placeholder.svg',
  '/routine-wonderful/lovable-uploads/89a650a8-5904-4b2d-813a-b1c664fb2d78.png',

  // Manually add build files (if they exist)
  '/routine-wonderful/assets/index-g2vRfnP6.js',
  '/routine-wonderful/assets/index-Bi3fIB4b.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Fetch and cache each URL individually.
        return Promise.all(
          urlsToCache.map(url =>
            fetch(url)
              .then(response => {
                // If the response isn't OK, log an error but continue.
                if (!response.ok) {
                  console.error(`Request for ${url} failed with status ${response.status}`);
                  return;
                }
                // Cache a clone of the response.
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Failed to fetch ${url}:`, error);
              })
          )
        );
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Only handle HTTP/HTTPS requests.
  if (requestURL.protocol !== 'http:' && requestURL.protocol !== 'https:') {
    return fetch(event.request);
  }
  
  // For navigation requests (e.g. when the user refreshes the page),
  // always return the cached index.html so that your SPA can load.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/routine-wonderful/index.html')
        .then(cachedResponse => cachedResponse || fetch(event.request))
        .catch(error => {
          console.error('Error fetching navigation request:', error);
          // Optionally, return a fallback page here.
        })
    );
    return;
  }

  // For all other requests, try to serve the cached response first.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
          // If the response is valid, clone it and store it in the cache.
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
