


var dbPromise = idb.open('posts-store', 1, function (db) {
    // Cache Posts we fetch from the Server stored in indexedDB 'posts-store'
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {keyPath: 'id'});
    }
    // For background synchronization tasks, to store data in our sync queue
    // Stores all the posts I want to synchronize  (used in feed.js)
    if (!db.objectStoreNames.contains('syncposts')) {
        db.createObjectStore('syncposts', {keyPath: 'id'});
    }
});

//Populate the indexedDB object store
function writeData(st, data) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
}

function readAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        });
}

function clearAllData(st) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(st,  'readwrite');
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        })
}

function deleteItemFromData(st, id) {
    dbPromise
        .then(function (db) {
            var tx = db.transaction(st,  'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(function () {
            console.log('Item deleted!');

        })
}

function getItemFromData(st, id) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(st,  'readwrite');
            var store = tx.objectStore(st);
            store.get(id);
        })
}

// From npm web-push: https://www.npmjs.com/package/web-push
/*
    "When using your VAPID key in your web app,
    you'll need to convert the URL safe base64 string
    to a Uint8Array to pass into the subscribe call..."
*/
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Convers a given base 64 to a file
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
}