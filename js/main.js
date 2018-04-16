let restaurants,
neighborhoods,
cuisines
var map
var markers = []

function isElementInViewport (el) {
  
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}

function lazyLoadImages() {
  var images = document.querySelectorAll("img[data-src]"),
  item;
  // load images that have entered the viewport
  [].forEach.call(images, function (item) {
    if (isElementInViewport(item)) {
      item.setAttribute("src",item.getAttribute("data-src"));
      item.removeAttribute("data-src")
    }
  })
  // if all the images are loaded, stop calling the handler
  if (images.length == 0) {
    window.removeEventListener("DOMContentLoaded", lazyLoadImages);
    window.removeEventListener("load", lazyLoadImages);
    window.removeEventListener("resize", lazyLoadImages);
    window.removeEventListener("scroll", lazyLoadImages);
  }
}


/**
* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
* Fetch all neighborhoods and set their HTML.
*/
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
* Set neighborhoods HTML.
*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
* Initialize Google map, called from HTML.
*/
window.initMap = () => {
  /* 
  Service worker registration
  */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  if (!self.indexedDB) 
  self.alert("Your browser doesn't support a stable version of IndexedDB. Offline feature will not be available.");
  
  else{
    window.addEventListener('load',()=>{
      DBHelper.createDB();
    });
  }
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  const mapEl = document.getElementById('map');
  mapEl.setAttribute("role", "application");
  mapEl.setAttribute("tabindex", 0);
  updateRestaurants();
  window.addEventListener("DOMContentLoaded", lazyLoadImages);
  window.addEventListener("load", lazyLoadImages);
  window.addEventListener("resize", lazyLoadImages);
  window.addEventListener("scroll", lazyLoadImages);
  
}

/**
* Update page and map for current restaurants.
*/
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  
  
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      console.log(restaurants)
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
* Clear current restaurants, their HTML and remove their map markers.
*/
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  
  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
* Create all restaurants HTML and add them to the webpage.
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  window.addEventListener("DOMContentLoaded", lazyLoadImages);
  window.addEventListener("load", lazyLoadImages);
  window.addEventListener("resize", lazyLoadImages);
  window.addEventListener("scroll", lazyLoadImages);
}

/**
* Create restaurant HTML.
*/
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  const src = DBHelper.imageUrlForRestaurant(restaurant);
  if(src)
  image.setAttribute('data-src',src)
  image.alt = `Restaurant ${restaurant.name}`
  li.append(image);
  
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)
  more.tabIndex = 0;
  
  return li
}

/**
* Add markers for current restaurants to the map.
*/
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
