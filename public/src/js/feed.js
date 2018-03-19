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
    cardTitleTextElement.style.color = 'white';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = 'The Unnamed Island';
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = 'In the Caribbean';
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get')
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        createCard();
    });
