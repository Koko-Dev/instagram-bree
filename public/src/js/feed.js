var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');


// click listener  (the big plus sign on main page)
function openCreatePostModal() {
    // "Un-hide" the form
    createPostArea.style.display = 'block';

    // change the transform property from 100vh on feed.css to 0 so that it will slide up all the way
    // We need a workaround to get it not to display block and translateY in one step
    setTimeout(function () {
        createPostArea.style.transform = 'translateY(0vh)';
    }, 20);

    // App Install Banner
    //    \ Check to see if var deferredPrompt from app.js is set This will only work IFF Chrome tried to set the
    // prompt first according to their criteria which is when user visits app the second time after five minutes
    if (deferredPrompt) {
        // show banner to add icon to home screen
        // remember that deferredPrompt = event, and even returns BeforeInstallPromptEvent
        //    which has the property prompt()
        deferredPrompt.prompt();

        //See what the user's choice is (to add to home screen or not)
        // userChoice is a Promise
        deferredPrompt.userChoice.then(function (choiceResult) {
            console.log(choiceResult.outcome);

            if (choiceResult.outcome === 'dismissed') {
                console.log('User cancelled installation');
            } else {
                console.log('User added to home screen');
            }
        });
        // because we cannot use deferredPrompt again
        deferredPrompt = null;
    }
    // UNREGISTER SERVICE WORKER
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.getRegistrations()
    //         .then(function (registrations) {
    //             for (var i = 0; i < registrations.length; i++) {
    //                 console.log('[feed.js] ... registrations[i] = ', registrations[i]);
    //                 registrations[i].unregister();
    //             }
    //         })
    // }
}

function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vh)';
    createPostArea.style.transitionProperty = 'all';
    createPostArea.style.transitionDuration = '1s';
    createPostArea.style.transitionTimingFunction = 'cubic-bezier(0, 1, 0.5, 1)';
    //createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
    console.log('clicked');
    if ('caches' in window) {
        caches.open('user-requested')
            .then(function (cache) {
                cache.add('https://httpbin.org/get');
                cache.add('/src/images/sf-boat.jpg');
            });
    }
}

// Helper function to clear cards
function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
}

function createCard(data) {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url(' + data.image + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = '#fff';
    cardTitleTextElement.style.fontFamily = "'Indie Flower', cursive";
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = data.title;
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = data.location;
    cardSupportingText.style.textAlign = 'center';

    // Used for Cache on Demand via Save Button
    // var cardSaveButton = document.createElement('button');
    // cardSaveButton.textContent = 'Save';
    // cardSaveButton.style.backgroundColor = 'darkgray';
    // cardSaveButton.addEventListener('click', onSaveButtonClicked);
    //cardSupportingText.appendChild(cardSaveButton);

    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
    clearCards();
    for (var i = 0; i < data.length; i++) {
        createCard(data[i]);
    }
}

var url = 'https://breegrams.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        console.log('From web', data);
        var dataArray = [];
        for (var key in data) {
            dataArray.push(data[key]);
        }
        updateUI(dataArray);
    });

if ('indexedDB' in window) {
    readAllData('posts')
        .then(function (data) {
            if (!networkDataReceived) {
                console.log('From cache', data);
                updateUI(data);
            }
        });
}

// Testing for a POST request instead
// When switching to firebase POST, go back to GET request code
// fetch(url, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//     },
//     body: JSON.stringify({
//         message: 'Some extraordinary message'
//     })
// })
//     .then(function (res) {
//         return res.json();
//     })
//     .then(function (data) {
//         networkDataReceived = true;
//         console.log('From web', data);
//         clearCards();
//         createCard();
//     });


// Used with Cache, then Network with Time Comparison and Dynamic Caching
// Can we access 'caches' Object from the User's Browser (window)?
// if ('caches' in window) {
//     // Can I find the URL I am trying to access in my cache?
//     caches.match(url)
//         .then(function (response) {
//             // response = null, if not in cache. IF null, do nothing
//             if (response) {
//                 return response.json();
//             }
//         })
//         .then(function (data) {
//             // if the URL is found in the cache
//             console.log('Data from Cache:  ', data);
//
//             // If Network is faster, do not createCard()
//             if (!networkDataReceived) {
//                 // Cache faster; clear last card and call the code that updates your page
//                 // clearCards();
//                 // createCard();
//
//                 // Using Firebase just to populate indexedDB
//                 // Convert data to an Array
//                 var dataArray = [];
//                 for (var key in data) {
//                     // the objects in firebase database called 'posts' with declared properties
//                     dataArray.push(data[key]);
//                 }
//                 updateUI(dataArray);
//
//             }
//         })
// }

// Register an event listener to the form
form.addEventListener('submit', function (event) {
    // prevent the default so that the page does not get loaded onsubmit
    // because the default of the submit event is to send data to the server
    event.preventDefault();

    // Check to see if we have data in the form
    // link to id='title' and id='location' on form in index.html
    // trim( ) removes whitespace from both sides of a string
    if (titleInput.value.trim() === '' || locationInput.value.trim() === ''){
        console.log('Title or Location is BLANK', titleInput.value, locationInput.value);
        alert('Please enter Title and Location');
        return;
    }
    closeCreatePostModal();

    // Background Synchronization Request
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        // Make sure SW is installed, activated, and ready to take some input
        // if SW is ready, returns the promise of the SW
        navigator.serviceWorker.ready
            .then(function (sw) {
                var post = {
                    id: new Date().toISOString() ,
                    title: titleInput.value,
                    locationInput: locationInput.value
                };
                writeData('syncposts', post)
                    .then(function () {
                        // REGISTER THE SYNCHRONIZATION TASK
                        // sw.sync gives us access to the SyncManager now from the SWs point of view
                        // Register our single submit event with it
                        // register() allows us to register a synchronization task with the SW
                        // the sync string is an id that clearly ids a given sync task
                        // the sync id is used in the SW to react to reestablish connectivity
                        // It is also used to check which tasks we have left and what we need to do with the task
                        return sw.sync.register('sync-new-post')
                    })
                    .then(function () {
                        // Access Material Design Lite's Snackbar Container -- A User Notification Feature
                        var snackbarContainer =  document.querySelector('#confirmation-toast');
                        var data = {message: 'Your Post was synced successfully!'};

                        // Properties provided by Material Design Lite
                        // This will provide a visual feedback to the User with the above message
                        snackbarContainer.MaterialSnackbar.showSnackbar(data);
                    })
                    .catch(function (err) {
                        console.log('There was an error with background syncing: ', err);

                    })
            })
    }
    
});

