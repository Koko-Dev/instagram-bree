// Make sure the SW is available and then register service worker
// This determines if navigator has the serviceWorker object/method/property
if ('serviceWorkder' in navigator) {
    navigator.serviceWorker
        // Use the slash "/" first to ensure you go to the root folder first
        // Register the service worker
        // register() returns a Promise
        .register('/sw.js')
        .then(function () {
            console.log("Service worker registered!");
        });
}