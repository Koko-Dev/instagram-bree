var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll('.enable-notifications');

// Check to see if the browser supports Promises
// If it does not, then point to polyfill promise.js
if (!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker is running in app.js!');
        })
}

// Chrome displays prompt after user visits site again after 5 minutes
// To prevent this from happening and set our own time, we prevent Chrome default
window.addEventListener('beforeinstallprompt', function (event) {
    // To prevent Chrome from showing the banner
    console.log('beforeinstallprompt is fired', event);

    // event returns BeforeInstallPromptEvent method prompt() to display banner
    // will call deferredPrompt.prompt() in feed.js when var shareImageButton is clicked
    deferredPrompt = event;
    event.preventDefault();

    // return false to not do anything upon this event fire
    return false;
});



// Notification Helper Function
function notificationPermissionRequest() {
    // If Notification Permission accepted, implicit Push permission is also given
    // Callback gives result of user choice
    Notification.requestPermission(function (result) {
        if (result !== 'granted') {
            console.log('Notifications were not permitted by User');
        } else {
            console.log('Notifications Permission Granted!!!');
            // Hide notification button
            displayNotificationConfirm();
        }
    });
}

function displayNotificationConfirm() {
    var options = {
        body: 'Subscription to Notification Services is a Success!'
    };
    new Notification('Subscription Success!!', options);
}

// If Browser supports Notification, turn on 'Enable Notifications' Button
if ('Notification' in window) {
    // Loop through all of the notification buttons
    console.log('BROWSER HAS NOTIFICATION CAPABILITIES!!!')
    for (var i = 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', notificationPermissionRequest);
    }
} else {
    console.log('NO BROWSER NOTIFICATION CAPABILITIES')
}




