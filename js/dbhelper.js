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
    if(!this.restaurantsArr){
      fetch(DBHelper.DATABASE_URL).then(response=>{
        if (response.status === 200) { // Got a success response from server!
          response.json().then(json=>{
            this.restaurantsArr = JSON.parse(JSON.stringify(json));
            const restaurants = json;
            callback(null, restaurants);
          })
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${response.status}`);
          callback(error, null);
        }
      }).catch(err=>{
        DBHelper.getDB((db)=>{
          var objectStore = db.transaction("restaurants").objectStore("restaurants");
          var restaurants = [];
          
          objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              restaurants.push(cursor.value);
              cursor.continue();
            }
            else {
              console.log("Read all restaurants from database");
              this.restaurantsArr = restaurants;
              callback(null,restaurants)
            }
          }
        })
      });
    }
    else{
      callback(null,this.restaurants)
      console.log(this.restaurantsArr)
    }
  }
  
  /**
  * Fetch a restaurant by its ID.
  */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    fetch(`${DBHelper.DATABASE_URL}/${id}`).then(response=>{
      console.log("then")
      if(response.status == 200){
        response.json().then(restaurant=>{
          console.log(restaurant)
          callback(null,restaurant)
        })
      } else if(response.status == 404){
        callback(`Restaurant does not exist. Returned status of ${response.status}`, null);
      } else{
        const error = (`Request failed. Returned status of ${response.status}`);
        callback(error, null);
      }
    }).catch(err=>{
      console.log("err")
      DBHelper.getDB(db=>{
        db.transaction("restaurants").objectStore("restaurants").get(parseInt(id)).onsuccess = function(event) {
          callback(null,event.target.result)
        };
      })
    });
  }
  
  /**
  * Fetch restaurants by a cuisine type with proper error handling.
  */
  static fetchRestaurantByCuisine(cuisine, callback) {
    
    
    // Fetch all restaurants  with proper error handling
    if(!this.restaurantsArr){
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
    else{
      const results = this.restaurantsArr.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    }
    
  }
  
  /**
  * Fetch restaurants by a neighborhood with proper error handling.
  */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    if(!this.restaurantsArr){
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
    else{
      const results = this.restaurantsArr.filter(r => r.neighborhood == neighborhood);
      callback(null, results);
    }
  }
  
  /**
  * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
  */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    if(!this.restaurantsArr){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          let results = restaurants
          if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          this.restaurantsArr = JSON.parse(JSON.stringify(results));
          callback(null, results);
        }
      });
    }
    else{
      let results = this.restaurantsArr
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(null, results);
    }
  }
  
  /**
  * Fetch all neighborhoods with proper error handling.
  */
  static fetchNeighborhoods(callback) {
    if(!this.restaurantsArr){
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
    else{
      let restaurants = this.restaurantsArr;
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    }
    
  }
  
  /**
  * Fetch all cuisines with proper error handling.
  */
  static fetchCuisines(callback) {
    
    if(!this.restaurantsArr){
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
    else{
      let restaurants = this.restaurantsArr
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
      callback(null, uniqueCuisines);
    }
    
    
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
    return (`/img/${restaurant.photograph}.webp`);
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
  static createDB(){
    fetch("http://localhost:1337/restaurants").then(data=>{
    data.json().then(restaurants=>{
      var request = window.indexedDB.open('restaurantsDB',1);
      
      request.onerror = function(event) {
        console.err(`Bad request with error code ${request.errorCode}`);
      };
      request.onsuccess = function (event) { 
        DBHelper.db = event.target.result;
      };
      request.onupgradeneeded = function(event) { 
        // Save the IDBDatabase interface 
        DBHelper.db = event.target.result;
        var db = DBHelper.db;
        
        // Create an objectStore for this database
        var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });
        objectStore.createIndex("neighborhood", "neighborhood", { unique: false });
        objectStore.createIndex("cuisine_type", "cuisine_type", { unique: false });
        
        objectStore.transaction.oncomplete = function(event) {
          // Store values in the newly created objectStore.
          var ObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
          restaurants.forEach(function(restaurant) {
            ObjectStore.add(restaurant);
          });
        };
      };
    });
  }).catch(err=>{
    var request = window.indexedDB.open("restaurantsDB");
    request.onerror = function(event) {
      console.err(`Bad request with error code ${request.errorCode}`);
    };
    request.onsuccess = function (event) { 
      DBHelper.db = event.target.result;
    };
  })
};
static getDB(callback){
  var request = window.indexedDB.open("restaurantsDB");
  request.onerror = function(event) {
    console.err(`Bad request with error code ${request.errorCode}`);
  };
  request.onsuccess = function (event) { 
    DBHelper.db = event.target.result;
    callback(DBHelper.db)
  };
}
}
Object.defineProperty(DBHelper, 'restaurantsArr', {
  value: undefined,
  writable : true,
  enumerable : true,
  configurable : false
});
