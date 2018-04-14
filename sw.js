var CACHE_NAME = 'restaurant-cache-v1';
var urlsToCache = [
  '.',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/main.js',
  'js/dbhelper.js',
  'js/restaurant_info.js'
];
genaratePaths(urlsToCache)

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    }).catch(()=>{console.log("error in opening cache")})
  );
});
if (!self.indexedDB) 
self.alert("Your browser doesn't support a stable version of IndexedDB. Offline feature will not be available.");
else{
  idb = self.indexedDB;
  self.addEventListener('activate',(event)=>{
    event.waitUntil(
      createDB()
    );
  });
}

self.addEventListener('fetch', function(event) {
  if(event.request.url.startsWith("http://localhost:1337/")){
  if(event.request.url != "http://localhost:1337/restaurants"){
  fetch(event.request).catch(()=>{
    //write logic for queried paths
  })
}
else{
  fetch(event.request).then(data=>{
    console.log("data")
    try{
      event.respondWith(
        new Promise((resolve,reject)=>{
          data.json().then((json)=>{
            let transaction = db.transaction(["restaurants"], "readwrite");
            
            transaction.oncomplete = function(event) {
              resolve(data);
            };
            
            transaction.onerror = function(event) {
              console.log("error")
              resolve(data);
            };
            var objectStore = transaction.objectStore("restaurants");
            json.forEach(restaurant => {
              var request = objectStore.add(restaurant);
              request.onsuccess = function(event) {
                console.log("success")
              };
            });
          });
        })
      );
    }
    catch(e){
      
    }
  }).catch(function() {
    console.log("not this")
    event.respondWith(
      new Promise((resolve,reject)=>{
        var objectStore = db.transaction("restaurants").objectStore("restaurants")
        var restaurants = [];
        
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            restaurants.push(cursor.value);
            cursor.continue();
          }
          else {
            console.log("Read all restaurants from database");
            resolve(restaurants);
          }
        };
      })
    );
  });
}
}
else{
  fetch(event.request).catch(()=>{return caches.match(event.request);})
}
});

function genaratePaths(arr){
  for(let i=1;i<=10;i++){
    arr.push(`img/${i}.jpg`)
    arr.push(`restaurant.html?id=${i}`)
  }
}

function createDB(){
  var request = idb.open('restaurantsDB',1);
  
  request.onerror = function(event) {
    console.err(`Bad request with error code ${request.errorCode}`);
  };
  request.onsuccess = function (event) { 
    db = event.target.result;
  };
  request.onupgradeneeded = function(event) { 
    // Save the IDBDatabase interface 
    var db = event.target.result;
    
    // Create an objectStore for this database
    var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });
    objectStore.createIndex("neighborhood", "neighborhood", { unique: false });
    objectStore.createIndex("cuisine_type", "cuisine_type", { unique: false });
    objectStore.transaction.oncomplete = function(event) {
      // Store values in the newly created objectStore.
      // restaurantObjectStore = db.transaction("restaurantsDB", "readwrite").objectStore("restaurants");
    };
  };
};

