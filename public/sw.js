// This is a service worker - instagram-bree sw.js
// Service workers react to specific events, but no DOM access

// Import indexedDB to SW
// importScripts allows us to distribute the idb.js script across multiple files
// ImportScripts can also be used to make the SW leaner and outsource code into a separate file
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v134';
var CACHE_DYNAMIC_NAME = 'dynamic-v125';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/utility.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/parkour-main.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// Open an indexedDB database  called 'posts-store'
var dbPromise = idb.open('posts-store', 1, function (db) {

    // Ensure there is no other objectStore with the name 'posts'
    if (!db.objectStoreNames.contains('posts')) {
        // Create an Object Store called 'posts' in the 'posts-store' IndexedDB Database
        //   with a keyPath called 'id'
        db.createObjectStore('posts', {keyPath: 'id'});
    }
});


// Removes oldest assets of cache recursively until the amount of assets are less than maxItems allowed
// function trimCache(cacheName, maxItems) {
//     caches.open(cacheName)
//         .then(function(cache) {
//             return cache.keys()
//                 .then(function (keys) {
//                     // Recursive until condition is no longer true
//                     // Deletes the oldest Assets first
//                     if (keys.length > maxItems) {
//                         cache.delete(keys[0])
//                             .then(trimCache(cacheName, maxItems));
//                     }
//                 })
//         })
// }


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

// Helper function to test if URL from STATIC_FILES is being called
// function isInArray(string, array) {
//     for (var i = 0; i < array.length; i++) {
//         if (array[i] === string) {
//             return true;
//         }
//     }
//     return false;
// }

// Improved Helper function to test if URL from STATIC_FILES is being called
// The one above would not catch '/',  '/index.html', etc.

function isInArray(string, array) {
    var cachePath;

    // request targets domain where we serve the page from (i.e. NOT a CDN)
    if (string.indexOf(self.origin) === 0) {
        console.log('matched ', string);

        // take the part of the URL AFTER the domain (e.g. after localhost:8080)
        cachePath = string.substring(self.origin.length);
    } else {
        cachePath = string;
    }
    return array.indexOf(cachePath) > -1;
}

// Using Firebase as our Database and Deployment
self.addEventListener('fetch', function (event) {

    var url = 'https://breegrams.firebaseio.com/posts';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(function (res) {
                    var clonedRes = res.clone();
                    clearAllData('posts')
                        .then(function () {
                            // store transformed cloned response
                            return clonedRes.json()
                        })
                        .then(function (data) {
                            for (var key in data) {
                                // store in indexedDB database
                                writeData('posts', data[key])
                                // FOR TEST ONLY-- delete item directly after it is written
                                //     .then(function () {
                                //         deleteItemFromData('posts', key);
                                //     })
                            }
                        });
                    return res;
                })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            })
                            .catch(function (err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                })
        );
    }
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
// Combining original strategy with Cache then Network with Time Comparison and Dynamic Caching
//    is called Cache, then Network with Offline Support

// self.addEventListener('fetch', function (event) {
//     var url = 'https://httpbin.org/get';
//     var staticAssets = STATIC_FILES;
//     if (event.request.url.indexOf(url) > -1) {
//         // Cache then Network Strategy with Time Comparison and Dynamic Caching for var url only
//         // But it fails when network is offline because we don't cache.match
//         // This is a good strategy for use cases when we do have internet access and
//         // we want to get something on screen quickly
//         //  because we fetch it from the cache first
//         //  Bad for offline because we don't try to fetch requests from the cache only
//         event.respondWith(
//             // Reaches out to cache first
//             caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function (cache) {
//                     // Nonetheless, we make a Network Request
//                     return fetch(event.request)
//                         .then(function (res) {
//                             // Trim Dynamic Cache
//                             //trimCache(CACHE_DYNAMIC_NAME, 10);
//
//                             // If it is there, store in the dynamic cache, if not do nothing
//                             // If we don't get it from the cache and can't get it from Network, out of luck
//                             cache.put(event.request, res.clone());
//                             // res is returned so that it reaches feed.js
//                             return res;
//                         });
//                 })
//         );
//     } else if (isInArray(event.request.url, STATIC_FILES))  {
//         // Regex exp tests if the event.request.url match any of the words in the .join STATIC_FILES.
//         // if true, then cache-only strategy
//         event.respondWith(
//             caches.match(event.request)
//         );
//     } else {
//         // For all other urls that don't use the Cache, then Network with Time Comp and Dyn Cache Strategy
//         // We will use Cache with Network Fallback Strategy
//         // Drawback is since we fetch from cache first we override updated data with Outdated Data.
//         event.respondWith(
//             caches.match(event.request)
//                 .then(function (response) {
//                     // Response from the Cache
//                     if (response) {
//                         // returning the value from the cache
//                         return response;
//                     } else {
//                         // Begin Dynamic Caching -- Cache from Network
//                         // if the key is not in the cache, store in a new cache
//                         return fetch(event.request)
//                         // Response from the Network
//                             .then(function (res) {
//                                 // Open a new cache for incoming from Network
//                                 return caches.open(CACHE_DYNAMIC_NAME)
//                                     .then(function (cache) {
//                                         // Trim Dynamic Cache
//                                         //trimCache(CACHE_DYNAMIC_NAME, 10);
//
//                                         // Put the new resource in the dynamic cache
//                                         // url-identifier and response (res)
//                                         // can only use response (res) once, so used res.clone() for caching
//                                         // temporarily disable cache.put to test initial Cache on Demand with Save Button
//                                         cache.put(event.request.url, res.clone());
//                                         return res;
//                                     })
//                             })
//                             .catch(function (err) {
//                                 // on Network Fetch Response error we turn to our fallback - offline.html
//                                 return caches.open(CACHE_STATIC_NAME)
//                                     .then(function (cache) {
//                                         // If event.request.url if from help page, then
//                                         // get the offline.html file when network is down, if /help not cached
//                                         // if (event.request.url.indexOf('/help')) {
//                                         //     return cache.match('/offline.html');
//                                         // }
//
//                                         // A better way..
//                                         // If the 'accept' header includes 'text/html' then return offline.html page
//                                         if (event.request.headers.get('accept').includes('text/html')) {
//                                             console.log('[ServiceWorker Worker] ... Accept: "text/html"', event.request.headers.get('accept'));
//                                             /*The output from:
//                                                         console.log('[ServiceWorker Worker] ... Accept: "text/html"', event.request.headers.get('accept'));
//                                             *       was:
//                                             *           text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*;q=0.8
//                                             *       but you had to use get() to get it.
//                                             *
//                                             *           */
//
//                                             return cache.match('/offline.html');
//                                         }
//                                     });
//                             });
//                     }
//                 })
//         );
//     }
// });

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

// Fires when the SW notes it has connectivity and an outstanding Synchronization Task
self.addEventListener('sync', function (event) {
    // At this point we know we have connectivity so we send the request to the server
    console.log('[Servcie Worker]... Background Synchronization', event);
    console.log('[Service Worker] ..  the event.tag property -- ', event.tag);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] ... Synchronization Task tag === "sync-new-post" has been verified');
        event.waitUntil(
            readAllData('syncposts')
                .then(function (data) {
                    // Send the data to the server
                    // Since User may have posted more than once while offline, we loop through data stored in indexedDB
                    for (let post of data) {
                        fetch('https://us-central1-breegrams.cloudfunctions.net/storePostData', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                id: post.id,
                                title: post.title,
                                location: post.location,
                                image: 'https://firebasestorage.googleapis.com/v0/b/breegrams.appspot.com/o/breeGrams-main.jpg?alt=media&token=6655d0ed-3a0c-4d18-bec7-fb782c81973e'
                            })
                        })
                            .then(function (res) {
                                console.log('[Service Worker] ... Send data - Post response:  ', res)
                                // Clean up 'syncposts' Object Store in IndexedDB after each post is handled
                                // Use our deleteItemFromData() method in utility.js to delete each post from indexedDB
                                if (res.ok) {
                                    res.json()
                                        .then(function (resData) {
                                            deleteItemFromData('syncposts', resData.id);
                                        })
                                }
                            })
                            .catch(function (err) {
                                // If the response in not ok, we do not delete it
                                console.log('[Service Worker] ... Error while sending Data', err);
                            })
                    }
                })
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    // Find out which notification it was
    var notification = event.notification;

    // Find out which action was clicked
    var action = event.action;

    console.log('event.notification == ', notification);

    if (action === 'confirm') {
        // action: 'confirm' set up in app.js
        console.log('Confirm was chosen');

        // The User interacted with the notification, so it should be closed, especially in the case of Android
        notification.close();
    } else {
        console.log('Notification was NOT closed.  event.action is: ', action);

        // Open a Page Upon User Interaction
        // clients == all window/browser tasks related to the Service Worker
        // clients.matchAll(): Returns a Promise for an array of Client objects
        event.waitUntil(
            clients.matchAll()
                .then(function (allClients) {
                    // find ONE visible window managed by the Service Worker and store it in var client
                    // if find() method returns true then it returns the value of that array element == browser window
                    //  returns underfined if false
                    var client = allClients.find(function (findOne) {
                        return findOne.visibilityState === 'visible';
                    });
                    if (client != undefined) {
                        // navigate to the url
                        // navigate() method of WindowClient interface loads a specified URL into
                        //    controlled client page then returns a Promise that resolves to the existing WindowClient

                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        // openWindow():
                        //Opens a new browser window for a given url and returns a Promise for the new WindowClient.
                        clients.openWindow(notification.data.url);

                    }
                })
        );
        
        // User interacted with notifications, so it should be closed, especially in the case of Android
        notification.close();
    }
});

// Listen to the Notification Close button
self.addEventListener('notificationclose', function (event) {
    console.log('Notification was closed', event);
});

// Listens for incoming Push Messages from Users who have subscriptions
// Each subscription on the server has its own endpoint
// If we send a push message from the server to the subscription's SW who created the subscription, it will receive it
// So if you unregister a SW, they will not get the message
self.addEventListener('push', function (event) {
    console.log('Push Notification Received', event);

    // I want to retrieve from index.js:  JSON.stringify({title: 'New Post', content: 'New Post Added'})
    // But first I want to see if I have some data attached to this event, and if so, extract it
    console.log('[Service Worker] ...  push event.data', event.data);

    var data = {
        title: 'Something Has Happened',
        content: 'Here is something you might want to check out.',
        openUrl: '/'
    };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        badge: '/src/images/icon1-96x96.png',
        icon: '/src/images/icon1-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    // The active SW can't show a Notification, it can only listen to events running in the background
    //  so we grab the its registration since that is the part running in the browser,
    //      the part that connects the SW to the Browser
    //  Should see a new message coming from the server whenever we create a new post
    //  Fallback is `var data={title:'Something Has Happened',content:'Here is something you might want to check out.'}
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
});

