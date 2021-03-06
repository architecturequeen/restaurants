let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  console.log("fetch restaurant from url called");
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      fetch(`http://localhost:1337/restaurants/${id}`).then(res => res.json()).then(function(restaurant){
        styleFavBtn(restaurant);
      })

      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = name ? `${name.innerHTML} Restaurant Photo`: "Restaurant Photo";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
// fillReviewsHTML = (reviews = self.restaurant.reviews) => {
fillReviewsHTML = () => {
  console.log("fill review called")
  const restaurantId =new URL(window.location.href).searchParams.get("id");
  document.getElementById("restaurantId").value = restaurantId;
  console.log("Restaurant ID", restaurantId)
  fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurantId}`)
  .then(res => res.json())
  .catch(error => console.error('Error:', error))
  .then(reviews => {
    console.log('Success:', reviews)
    console.log("reviews from fetch", reviews)
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  });
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute("class", "reviewer");
  li.appendChild(name);

  const date = document.createElement('p');
  // date.innerHTML = review.date;
  date.innerHTML = new Date(review.createdAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("class", "rating");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 * Update Styling of Favourite Button
 */
styleFavBtn = (restaurant) => {
  const FAVOURITED_COLOUR = "rgb(255, 165, 0)";
  const DEFAULT_COLOUR = "rgb(0, 0, 0)"
  let favBtn = document.getElementById("fav-btn");
  favBtn.style.color = restaurant.is_favorite === "false" ? DEFAULT_COLOUR : FAVOURITED_COLOUR

}


/**
 * Mark Restaurant As Favourite
 */
 markRestaurantAsFavourite = () => {
  const restaurantId = new URL(window.location.href).searchParams.get("id");
  let favBtn = document.getElementById("fav-btn");
  const getFavBtnStyles = window.getComputedStyle(favBtn);
  const FAVOURITED_COLOUR = "rgb(255, 165, 0)";
  const DEFAULT_COLOUR = "rgb(0, 0, 0)";
  const favouriteResturantUrl = `http://localhost:1337/restaurants/${restaurantId}/?is_favorite=true`;
  const unfavouriteRestaurantUrl = `http://localhost:1337/restaurants/${restaurantId}/?is_favorite=false`
  const favouriteRequestUrl = (getFavBtnStyles.getPropertyValue("color") === FAVOURITED_COLOUR) ? unfavouriteRestaurantUrl : favouriteResturantUrl
  fetch(favouriteRequestUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
  .then(function(response) {
    console.log(response);
    if (response.ok){
      favBtn.style.color = (getFavBtnStyles.getPropertyValue("color") === FAVOURITED_COLOUR) ? DEFAULT_COLOUR : FAVOURITED_COLOUR
    }
    return response.json();
  });
 }

 submitReview = () => {
  const name = document.getElementById("user").value;
  const rating = document.getElementById("rating").value;
  const comments = document.getElementById("comments").value;
  const restaurant_id = new URL(window.location.href).searchParams.get("id");

  console.log("will add to db", {name, rating, comments, restaurant_id})

  if (name == null | name.trim() == "" | rating == null | rating.trim() == "" | comments == null | comments.trim() == "" | restaurant_id == null | restaurant_id.trim() == ""){
    console.log("empty fields");
    console.log( {name, rating, comments, restaurant_id});
  }
  else {
    // does db exist?
    // if yes, add pending request
    // if no, add pending request AND register sync
   var indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    var open = indexedDB.open("PendingReviewsDB", 1);

    open.onupgradeneeded = function() {
      var db = open.result;
      var store = db.createObjectStore("PendingReviews", { keyPath: "id" });
    };


    open.onsuccess = function() {
      console.log("pending reviews db created");
      var db = open.result;
      var tx = db.transaction("PendingReviews", "readwrite");
      var store = tx.objectStore("PendingReviews");
      var putReq = store.put({ id: "0", name, rating, comments, restaurant_id }).onsuccess = function(res){
        console.log("done", res.target.result);

        navigator.serviceWorker.ready.then(function(swRegistration) {
          return swRegistration.sync.register('aSync').then(() => {
            console.log('Ola! Sync registered');

          });
        });

      }
    }
  }

  window.location.href = "http://localhost:8000";


 }


