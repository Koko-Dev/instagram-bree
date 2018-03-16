var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

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
