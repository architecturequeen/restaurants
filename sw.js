const filesToCache = [
  'index.html',
  'restaurant.html',
  './css/custom.css',
  './css/styles.css'
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



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
        return fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        }).catch(function(){
          return fromCache(event.request);
        });

    })
  );

  // event.respondWith(
  //   caches.open(cacheName).then(function(cache) {
  //     return cache.match(event.request).then(function (response) {
  //       return response || fetch(event.request).then(function(response) {
  //         cache.put(event.request, response.clone());
  //         return response;
  //       });
  //     });
  //   })
  // );



});

self.addEventListener('sync', function(event) {
  if (event.tag == 'aSync') {
    console.log("syyynnnnc")
    event.waitUntil(addReview());
  }
});


const addReview = () => {
  var indexedDB =
      self.indexedDB ||
      self.mozIndexedDB ||
      self.webkitIndexedDB ||
      self.msIndexedDB ||
      self.shimIndexedDB;

    var open = indexedDB.open("PendingReviewsDB", 1);

    open.onupgradeneeded = function() {
      var db = open.result;
      var store = db
    }

    open.onsuccess = function() {
      var db = open.result;
      var tx = db.transaction("PendingReviews", "readwrite");
      var store = tx.objectStore("PendingReviews");

      store.get("0").onsuccess = function(res) {
        if (res.target.result.name ){
          console.log(res.target.result)
          const name = res.target.result.name;
          const rating = res.target.result.rating;
          const comments = res.target.result.comments;
          const restaurant_id = res.target.result.restaurant_id;
          console.log("request -->", {name, rating, comments, restaurant_id})

          fetch("http://localhost:1337/reviews/", {
            method: "POST",
            body : JSON.stringify({name, rating, comments, restaurant_id}),
            headers: { "Content-Type": "application/json"}
          })
          .then(function (response) {
            console.log(response)

          })
          .catch(function (error) {
            console.log('Request failed', error);
          });

        }
      }
    }

}

function fromCache(request) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request);
  });
}

function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    var timeoutId = setTimeout(reject, timeout);

    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      fulfill(response);
    }, reject);
  });
}

function update(request) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request).then(function (response) {
      console.log("request res")
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}


