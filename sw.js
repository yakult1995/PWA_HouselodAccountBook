importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

// Debugを有効に
workbox.setConfig({
  debug: true
});

// cache name設定
workbox.core.setCacheNameDetails({
  prefix    : 'In-Out-Checker',
  suffix    : 'v1',
  Precache  : 'precache',
  runtime   : 'runtime'
});

// Precache list
workbox.precaching.precacheAndRoute(
    [
        'css/bootstrap4.1.3.min.css',
        {
            url: 'css/style.css',
            revision: '4200'
        },
        'js/sha256.js',
        'js/jquery-3.3.1.min.js',
        'js/axios.js',
        'js/popper.1.14.3.min.js',
        'js/vue.min.js',
        'js/bootstrap4.1.3.min.js',
        {
            url: 'js/common.js',
            revision: '4200'
        },
        {
            url: '/index.html',
            revision: '4200',
        }
    ],
    {
        // "/"と"/index.html"を区別しない
        directoryIndex: null,
    });

workbox.routing.registerNavigationRoute('/index.html');

workbox.routing.registerRoute(
    new RegExp('.*\.js'),
    // workbox.strategies.networkFirst()
    workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
    new RegExp('/.*\.css/'),
    workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
    new RegExp('/.*\.woff2/'),
    workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
    new RegExp('/.+(\/|.html)$/'),
    workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
    // Cache image files
    new RegExp('/.*\.(?:png|jpg|jpeg|svg|gif)/'),
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
        plugins: [
            new workbox.expiration.Plugin({
                // Cache only 20 images
                maxEntries: 20,
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ],
    })
);