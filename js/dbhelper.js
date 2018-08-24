/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return "http://localhost:1337/restaurants";
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `./img/${restaurant.id}.webp`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    var open = indexedDB.open("ResturantDatabase", 1);

    open.onupgradeneeded = function() {
      var db = open.result;
      var store = db.createObjectStore("RestaurantStore", { keyPath: "id" });
    };

    open.onsuccess = function() {
      console.log("db created");
      var db = open.result;
      var tx = db.transaction("RestaurantStore", "readwrite");
      var store = tx.objectStore("RestaurantStore");

      store.get("all").onsuccess = function(res) {
        // if json result not cached, make a server call
        if (res.target.result === undefined) {
          console.log("make a fresh call to server for json data");
          let xhr = new XMLHttpRequest();
          xhr.open("GET", DBHelper.DATABASE_URL);
          xhr.onload = () => {
            if (xhr.status === 200) {
              // Got a success response from server!
              let restaurants = JSON.parse(xhr.responseText);

              // // get all reviews
              // fetch("http://localhost:1337/reviews")
              // .then(res => res.json())
              // .catch(error => console.error('Error:', error))
              // .then(reviews => {
              //   console.log('Success:', reviews)

              //   for (let res in restaurants){
              //     restaurants[res]["reviews"]= [];
              //     for (let rev in reviews){
              //       if(reviews[rev].restaurant_id === reviews[rev].id){
              //         restaurants[res].reviews.push(reviews[rev])
              //       }
              //     }
              //   }
              // console.log("FINAL RES", restaurants)

              // var tx = db.transaction("RestaurantStore", "readwrite");
              // var store = tx.objectStore("RestaurantStore");
              // store.put({ id: "all", restaurants: restaurants });
              // callback(null, restaurants);
              // })

              var tx = db.transaction("RestaurantStore", "readwrite");
              var store = tx.objectStore("RestaurantStore");
              store.put({ id: "all", restaurants: restaurants });
              callback(null, restaurants);

            } else {
              // Oops!. Got an error from server.
              const error = `Request failed. Returned status of ${xhr.status}`;
              callback(error, null);
            }
          };
          xhr.send();
        }
        // if json result cached, use cache
        else {
          console.log("use cached json data");
          callback(null, res.target.result.restaurants);
        }
      };
    };
  }
}
