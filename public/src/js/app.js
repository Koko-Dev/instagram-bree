var deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker is running in app.js!');
        })
}

// Chrome displays prompt after user visits site again after 5 minutes
// To prevent this from happening and set our own time we prevent Chrome default
window.addEventListener('beforeinstallprompt', function (event) {
    // To prevent Chrome from showing the banner

    console.log('beforeinstallprompt is fired', event);

    // event returns BeforeInstallPromptEvent method prompt() to display banner
    // will call deferredPrompt.prompt() in feed.js when var shareImageButton is clicked
    deferredPrompt = event;
    event.preventDefault();

    // return false to not do anything upon this event
    return false;
    

});

