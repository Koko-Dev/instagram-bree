// This is a service worker - instagram-bree sw.js
// Service workers react to specific events, but no DOM access

var CACHE_STATIC_NAME = 'static-v38';
var CACHE_DYNAMIC_NAME = 'dynamic-v19';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Pre-Caching App Shell');
                return cache.addAll(STATIC_FILES);
            }));
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ...', event);

    // Clean up an old cache after a Service Worker Update required for changes to resources cached
    // use waitUntil() to ensure the changes complete updating
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                console.log('[Service Worker keyList]', keyList);
                return Promise.all(keyList.map(function (key) {
                    if (key != CACHE_STATIC_NAME && key != CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                }))
            })
    );

    // self.clients.clain() ensures that SWs are loaded or are activated correctly.
    // Not necessary, but does make the code more robust.
    return self.clients.claim();
});


// Non-Life-Cycle Event



/* When a fetch event is triggered,  such as an img tag requesting an image,
 *  we hijack the output and respond with whatever we want to respond with.
 *  The point is, the response has to go through the Service Worker
 *  Using fetch(), we can look at a SW as a network proxy.
 *  Use respondsWith() so that every outgoing fetch request and response goes through the SW.
 */
// self.addEventListener('fetch', function (event) {
//     // fetch event will happen, for example, if html asks for img
//     //console.log('[Service Worker] Fetching something ...', event);
//
//     // Use respondsWith() to Override the data which gets sent back
//     //event.respondWith(fetch(event.request));
//
//     // fetch the data from the Cache API
//     // request are your keys == keys are a request object, and store in new cache
//     event.respondWith(
//         caches.match(event.request)
//             .then(function (response) {
//                 // Response from the Cache
//                 if (response) {
//                     // returning the value from the cache
//                     return response;
//                 } else {
//                     // Begin Dynamic Caching -- Cache from Network
//                     // if the key is not in the cache, store in a new cache
//                     return fetch(event.request)
//                     // Response from the Network
//                         .then(function (res) {
//                             // Open a new cache for incoming from Network
//                             return caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function (cache) {
//                                     // Put the new resource in the dynamic cache
//                                     // url-identifier and response (res)
//                                     // can only use response (res) once, so used res clone for caching
//                                     // Parameters:
//                                     // temporarily disable cache.put to test initial Cache on Demand with Save Button
//                                     cache.put(event.request.url, res.clone());
//                                     return res;
//                                 })
//                         })
//                         .catch(function (err) {
//                             // on Network Fetch Response error we turn to our fallback - offline.html
//                             return caches.open(CACHE_STATIC_NAME)
//                                 .then(function (cache) {
//                                     // get the offline.html file
//                                     return cache.match('/offline.html')
//                                 })
//
//                         })
//                 }
//             })
//     );
// });

// Used with Cache, then Network with Time Comparison and Dynamic Caching
// Requires SW and feed.js
// This will will put all the static files in the dynamic cache. This will be fixed later.
// Another problem is that this is bad for offline first because we never fetch from cache
// Combining original stragegy with Cache then Network with Time Comparison and Dynamic Caching
//    is called Cache, then Network with Offline Support
self.addEventListener('fetch', function (event) {
    var url = 'https://httpbin.org/get';
    var staticAssets = STATIC_FILES;
    if (event.request.url.indexOf(url) > -1) {
        // Cache then Network Strategy with Time Comparison and Dynamic Caching for var url only
        // But it fails when network is offline because we don't cache.match
        // This is a good strategy for use cases when we do have internet access and
        // we want to get something on screen quickly
        //  because we fetch it from the cache first
        //  Bad for offline because we don't try to fetch requests from the cache only
        event.respondWith(
            // Reaches out to cache first
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                    // Nonetheless, we make a Network Request
                    return fetch(event.request)
                        .then(function (res) {
                            // If it is there, store in the dynamic cache, if not do nothing
                            // If we don't get it from the cache and can't get it from Network, out of luck
                            cache.put(event.request, res.clone());
                            // res is returned so that it reaches feed.js
                            return res;
                        })
                })
        );
    } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {
        // Regex exp tests if the event.request.url match any of the words in the .join STATIC_FILES.
        // if true, then cache-only strategy
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        // For all other urls that don't use the Cache, then Network with Time Comp and Dyn Cache Strategy
        // We will use Cache with Network Fallback Strategy
        // Drawback is since we fetch from cache first we override updated data with Outdated Data.
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    // Response from the Cache
                    if (response) {
                        // returning the value from the cache
                        return response;
                    } else {
                        // Begin Dynamic Caching -- Cache from Network
                        // if the key is not in the cache, store in a new cache
                        return fetch(event.request)
                        // Response from the Network
                            .then(function (res) {
                                // Open a new cache for incoming from Network
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        // Put the new resource in the dynamic cache
                                        // url-identifier and response (res)
                                        // can only use response (res) once, so used res clone for caching
                                        // Parameters:
                                        // temporarily disable cache.put to test initial Cache on Demand with Save Button
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            })
                            .catch(function (err) {
                                // on Network Fetch Response error we turn to our fallback - offline.html
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        // If event.request.url if from help page, then 
                                        // get the offline.html file when network is down, if /help not cached
                                        if (event.request.url.indexOf('/help') > -1) {
                                            return cache.match('/offline.html');
                                        }

                                    })

                            })
                    }
                })
        )

    }

});

// Cache, then Network
// Gets asset as quickly as possible from the Cache and then also try to fetch update from the Network
// If Network is faster than retrieving from cache, then Network first
// Simultaneously, Page reaches out to cache While Page sends out Network Request that is intercepted by SW
// Simultaneously, SW will try to get response from Network (and SW receives response) While we return
//  fetch data to Page.
// Also use Dynamic Caching
// Implemented by sw.js and feed.js


// Network with Cache Fallback and Dynamic Caching
// Not the best solution due to the browser timeout problem
// If the network is down, will wait about 60 seconds trying to connect before turning to cache
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//             .then(function (res) {
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function (cache) {
//                         cache.put(event.request.url,  res.clone());
//                         return res;
//                     })
//             })
//             .catch(function (err) {
//                 return caches.match(event.request)
//             })
//     );
// });

// Network with Cache Fallback
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//             .catch(function (err) {
//                 return caches.match(event.request)
//             })
//     );
// });


// Cache-only
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//     )
// });