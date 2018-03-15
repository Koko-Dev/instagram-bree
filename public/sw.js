// This is a service worker
// Service workers react to specific events, but no DOM access

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Servent Worker ...', event);
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Servent Worker ...', event);

    // self.clients.clain() ensures that SWs are loaded or are activated correctly.
    // Not necessary, but does make the code more robust.
    return self.clients.claim();
});

