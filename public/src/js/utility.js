


var dbPromise = idb.open('posts-store', 1, function (db) {
    // Cache Posts we fetch from the Server stored in indexedDB 'posts-store'
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {keyPath: 'id'});
    }
    // For background synchronization tasks, to store data in our sync queue
    // Stores all the posts I want to synchronize  (used in feed.js)
    if (!db.objectStoreNames.contains('sync-posts')) {
        db.createObjectStore('sync-posts', {keyPath: 'id'});
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