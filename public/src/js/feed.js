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


// Currently in use, allows us to save assets in cache on demand
function onSaveButtonClicked(event) {
    // We get the event object because we have an event listener
    console.log('[feed.js] ... clicked', event);

    // If 'caches' Object exists in 'window' Object
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

function createCard() {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url("/src/images/unamed-island.jpg")';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '180px';
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = '#F2F57B';
    cardTitleTextElement.style.boxShadow = '5px 7px #888888';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = 'The Unnamed Island';
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = 'In the Caribbean';
    cardSupportingText.style.textAlign = 'center';
    
    // Used for Cache on Demand via Save Button
    var cardSaveButton = document.createElement('button');
    cardSaveButton.textContent = 'Save';
    cardSaveButton.style.backgroundColor = 'darkgray';
    cardSaveButton.addEventListener('click', onSaveButtonClicked);
    cardSupportingText.appendChild(cardSaveButton);
    cardWrapper.appendChild(cardSupportingText);

    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get')
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        createCard();
    });

