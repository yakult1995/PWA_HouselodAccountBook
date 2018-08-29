var CACHE_STATIC_VERSION = 'v.2.2.1';
var urlsToCache = [
    'sw.js',
    'manifest.json',
    'index.html',
    'css/style.css',
    'js/common.js',
    'css/bootstrap4.1.3.min.css',
    'js/jquery-3.3.1.min.js',
    'js/popper.1.14.3.min.js',
    'js/vue.min.js',
    'js/bootstrap4.1.3.min.js',
    'https://fonts.googleapis.com/css?family=Quicksand',
    'https://fonts.googleapis.com/earlyaccess/notosansjapanese.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_VERSION)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames.map(function(key) {
            if (key !== CACHE_STATIC_VERSION) {
                console.log('DELETE CACHE : ' + key);
                return caches.delete(key);
            }
        }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return caches.open(CACHE_STATIC_VERSION)
    .then(function(cache) {
        console.log('CLONE SUCCESS');
        cache.put(url, response.clone());
      return response;
    });
  })
  .catch(function(error) {
    console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}