let restaurant;
var map;

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
      callback(null, restaurant)
    });
  }
}

/**
* Create restaurant HTML and add it to the webpage
*/
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name + "  " + `<i id="fav"></i>`;
  
  const fav = document.getElementById('fav');
  DBHelper.getDB((db)=>{
    var objectStore = db.transaction("favs")
    .objectStore("favs")
    .get(parseInt(restaurant.id))
    .onsuccess = function(event){
      if(event.target.result.starred){
        fav.setAttribute("class","fa fa-star");
      }
      else{
        fav.setAttribute("class","fa fa-star-o");
      }
      var starred = event.target.result.starred;
      fav.addEventListener('click',function(){
        starred = !starred;
        var this_ = this,classes = ["fa fa-star","fa fa-star-o"];
        db.transaction("favs","readwrite").objectStore("favs").put({id: restaurant.id, starred: starred})
        .onsuccess = ()=>{
          this_.setAttribute("class",classes[(classes.indexOf(this.getAttribute("class"))+1)%2])}
        })
      }
    })
    const coverImage = document.getElementById('restaurant-img');
    coverImage.alt = `Restaurant ${restaurant.name}`;
    
    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    
    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
    
    // fill operating hours
    if (restaurant.operating_hours) {
      fillRestaurantHoursHTML();
    }
    // fill reviews
    fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurant.id}`).then((res)=>{
    res.json().then((json)=>{
      fillReviewsHTML(json)
    })
  }).catch(()=>{
    DBHelper.getDB(db=>{
      db.transaction("restaurants").objectStore("restaurants").get(parseInt(restaurant.id)).onsuccess = function(event){
        fillReviewsHTML(event.target.result.reviews)
      }
    })
  })
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
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews' + `  <i id="openModal" class = "fa fa-pencil-square-o"></i>`;
  container.appendChild(title);
  const openModal = document.getElementById('openModal');
  openModal.style.cursor= "pointer";
  const modal = document.getElementById('myModal');
  openModal.addEventListener("click",()=>{
    modal.style.display= "block";
  });
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
  
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  
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
}

/**
* Create review HTML and add it to the webpage.
*/
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  
  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt);
  li.appendChild(date);
  
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
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

