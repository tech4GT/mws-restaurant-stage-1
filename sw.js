var CACHE_NAME = 'restaurant-cache-v1';
var urlsToCache = [
  '.',
  'index.html',
  'restaurant.html',
  'css/styles.min.css',
  'js/minMain.js',
  'js/resto.min.js',
  'js/dbMin.js'
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
  event.respondWith(caches.match(event.request).then(function (response) {
    return response || fetch(event.request);
    }));
// event.respondWith(fetch(event.request).catch(()=>{return caches.match(event.request);}))
});
function genaratePaths(arr){
  for(let i=1;i<=10;i++){
    arr.push(`img/${i}.webp`)
    arr.push(`restaurant.html?id=${i}`)
  }
}

