/* As a page is visited, it is stored in a a cache*/
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('restaurants-v1').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
