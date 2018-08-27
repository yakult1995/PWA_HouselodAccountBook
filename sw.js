// ServiceWorker処理：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja

// キャッシュ名とキャッシュファイルの指定
var CACHE_STATIC_VERSION = 'v.2.0.0';
var urlsToCache = [
    '/pwa/',
    '/pwa/css/style.css',
    '/pwa/js/common.js'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_STATIC_VERSION)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソース更新処理
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_VERSION) {
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});