'use strict';

console.log('This is your service-worker.js file!');

const FILES_TO_CACHE = [
  `/db.js`,
  `/index.html`,
  `/index.js`,
  `/index.css`,
  `/manifest.webmanifest`,
  `/icons/icon-192x192.png`,
  `/icons/icon-512x512.png`,
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener(`install`, (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener(`activate`, (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        // return array of cache names that are old to delete
        cacheNames.filter((cacheName) => !currentCaches.includes(cacheName))
      )
      .then((cachesToDelete) =>
        Promise.all(
          cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});