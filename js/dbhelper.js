/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurants = JSON.parse(xhr.responseText);
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL + `/${id}`);
    xhr.onload = ()=>{
      if(xhr.status == 200){
        const restaurant = JSON.parse(xhr.responseText);
        callback(null,restaurant)
      } else if(xhr.status == 404){
        callback(`Restaurant does not exist. Returned status of ${xhr.status}`, null);
      } else{
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    }
    xhr.send();
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL + `/?cuisine_type=${cuisine}`);
    xhr.onload = ()=>{
      if(xhr.status == 200){
        const restaurant = JSON.parse(xhr.responseText);
        callback(null,restaurant)
      } else{
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    }
    xhr.send();


    // Fetch all restaurants  with proper error handling
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     callback(error, null);
    //   } else {
    //     // Filter restaurants to have only given cuisine type
    //     const results = restaurants.filter(r => r.cuisine_type == cuisine);
    //     callback(null, results);
    //   }
    // });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL + `/?neighborhood=${neighborhood}`);
    xhr.onload = ()=>{
      if(xhr.status == 200){
        const restaurant = JSON.parse(xhr.responseText);
        callback(null,restaurant)
      } else{
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    }
    xhr.send();
    // Fetch all restaurants
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     callback(error, null);
    //   } else {
    //     // Filter restaurants to have only given neighborhood
    //     const results = restaurants.filter(r => r.neighborhood == neighborhood);
    //     callback(null, results);
    //   }
    // });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {

    console.log(arguments)
    let xhr = new XMLHttpRequest(),url=this.DATABASE_URL;
    if(cuisine!="all"){
      url = url + `/?cuisine_type=${cuisine}`;
    if(neighborhood!="all"){
      url = url + `,neighborhood=${neighborhood}`
    }
  }
  else{
    if(neighborhood!="all"){
      url = url + `/?neighborhood=${neighborhood}`
    }
  }
    console.log(url)
    xhr.open('GET', url);
    xhr.onload = ()=>{
      if(xhr.status == 200){
        const restaurants = JSON.parse(xhr.responseText);
        callback(null,restaurants)
      } else{
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    }
    xhr.send()



    // Fetch all restaurants
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     callback(error, null);
    //   } else {
    //     let results = restaurants
    //     if (cuisine != 'all') { // filter by cuisine
    //       results = results.filter(r => r.cuisine_type == cuisine);
    //     }
    //     if (neighborhood != 'all') { // filter by neighborhood
    //       results = results.filter(r => r.neighborhood == neighborhood);
    //     }
    //     callback(null, results);
    //   }
    // });
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
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph != undefined)
      return (`/img/${restaurant.photograph}.jpg`);
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
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
