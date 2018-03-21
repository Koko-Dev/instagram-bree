// This is a service worker - instagram-bree sw.js
// Service workers react to specific events, but no DOM access

var CACHE_STATIC_NAME = 'static-v18';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Pre-Caching App Shell');
                return cache.addAll([
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
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    '/src/images/main-image.jpg',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
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
/*

// Non-Life-Cycle Event

/!* When a fetch event is triggered,  such as an img tag requesting an image,
 *  we hijack the output and respond with whatever we want to respond with.
 *  The point is, the response has to go through the Service Worker
 *  Using fetch(), we can look at a SW as a network proxy.
 *  Use respondsWith() so that every outgoing fetch request and response goes through the SW.
 *!/
self.addEventListener('fetch', function (event) {
    // fetch event will happen, for example, if html asks for img
    //console.log('[Service Worker] Fetching something ...', event);

    // Use respondsWith() to Override the data which gets sent back
    //event.respondWith(fetch(event.request));

    // fetch the data from the Cache API
    // request are your keys == keys are a request object, and store in new cache
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
                                    // get the offline.html file
                                    return cache.match('/offline.html')
                                    
                                    
                                })
                            
                        })
                }
            })
    );
});
*/

// FOR CACHE ONLY
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            /*.then(function (response) {
                return response;
            })*/
    );
});
