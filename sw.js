var CACHE_NAME = 'restaurant-cache-v1';
var urlsToCache = [
  '.',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/main.js',
  'js/dbhelper.js',
  'js/restaurant_info.js',
  'data/restaurants.json'
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

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      console.log("code at work")
      return caches.match(event.request);
    })
  );
});

function genaratePaths(arr){
  for(let i=1;i<=10;i++){
    arr.push(`img/${i}.jpg`)
    arr.push(`restaurant.html?id=${i}`)
  }
}
