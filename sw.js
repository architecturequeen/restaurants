const filesToCache = [
  'index.html',
  'restaurant.html',
  './css/custom.css',
  './css/grid.css',
  './css/styles.css',
  './css/under500.css',
  './css/under620.css',
  './css/under800.css'
];

const cacheName = 'restaurants-v1';

self.addEventListener('install', function(event) {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(cacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});


/* As a page is visited, it is stored in a a cache*/
self.addEventListener('fetch', function(event) {
  console.log('fetch')
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
