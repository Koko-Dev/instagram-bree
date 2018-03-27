var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
    createPostArea.style.display = 'block';

    // Check to see if var deferredPrompt from app.js is set
    // This will only work IFF Chrome tried to set the prompt first according to their criteria
    //    which is when user visits app the second time after five minutes
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
}

function closeCreatePostModal() {
    createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


// Currently not in use, allows us to save assets in cache on demand otherwise
/*
function onSaveButtonClicked(event) {
    // We get the event object because we have an event listener
    console.log('[feed.js] ... clicked', event);

    // If 'caches' Object exists in 'window' Object (User's Browser)
    //  then open/create a cache named 'user-requested'
    if ('caches' in window) {
        caches.open('user-requested')
            .then(function (cache) {
                // store the assets user wants saved

                // https://httpbin.org/get is the url the request will be sent to
                // We will store it
                cache.add('https://httpbin.org/get');

                // Store the image of post
                cache.add('/src/images/unamed-island.jpg');
            })
    }
}
*/

// Helper function to clear cards
function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
}

function createCard() {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url("/src/images/breeGrams-main.jpg")';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '180px';
    //cardTitle.style.fontWeight = 'bold';
    //cardTitle.style.zIndex = 10;
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = '#C9BAB1';
    cardTitleTextElement.style.boxShadow = '3px 5px #D9E0EF';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = 'No Holding Back';
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = 'A Girl with Dreams';
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



// To reach out to the Network to fetch some data
// Used in Cache on Demand
// Used with Cache, then Network with Time Comparison and Dynamic Caching
//var url = 'https://httpbin.org/get';
var networkDataReceived = false;

// For POST request
var url = 'https://httpbin.org/post';


// Default is GET request
// fetch(url)
//     .then(function (res) {
//         return res.json();
//     })
//     .then(function (data) {
//         // If networkDataReceived is true then Network is faster
//         networkDataReceived = true;
//         console.log('Data from Web: ', data);
//         // Network faster; clear last card and call the code that updates your page
//         clearCards();
//         createCard();
//     });

// Testing for a POST request instead
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        message: 'Some extraordinary message'
    })
})
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        console.log('From web', data);
        clearCards();
        createCard();
    });


// Used with Cache, then Network with Time Comparison and Dynamic Caching
// Can we access 'caches' Object from the User's Browser (window)?
if ('caches' in window) {
   // Can I find the URL I am trying to access in my cache?
    caches.match(url)
        .then(function (response) {
            // response = null, if not in cache. IF null, do nothing
            if (response) {
                return response.json();
            }
        })
        .then(function (data) {
            // if the URL is found in the cache
            console.log('Data from Cache:  ', data);

            // If Network is faster, do not createCard()
            if (!networkDataReceived) {
                // Cache faster; clear last card and call the code that updates your page
                clearCards();
                createCard();
            }
        })
}

