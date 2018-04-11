 // NOTE:  This is our NodeJS code running on the Firebase Server
 // Another option would be to run my own MEAN Stack

var functions = require('firebase-functions');

// Access to Database
var admin = require('firebase-admin');

// Send the right headers to access http endpoint from an app running on a different server
var cors = require('cors')({origin: true});

// Used for Push Messages: https://www.npmjs.com/package/web-push
var webpush = require('web-push');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// Initialize the app so that we can access firebase database with admin
// Give location of the Database and the Keyfile from Settings/Project Settings/Service Accounts/ServiceAccount path url
//  to Generate New Private Key.  Link to var serviceAccount -- Code from Firebase
var serviceAccount = require("./breegram-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://breegrams.firebaseio.com/',
});

exports.storePostData = functions.https.onRequest(function (request, response) {
    cors(request, response, function () {
        // Another option here would be to use MongoDB to store Data instead of the Firebase Database
        // Here we store data on new posts, and will send Push Messages to all Subscribed Clients
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        })
            .then(function () {
                // from npm web-push:  https://www.npmjs.com/package/web-push
                // webpush.setVapidDetails(email, public key, private key)
                // The public key does not need to be transformed to the urlBase64ToUint8Array() on the backend
                // Now the webpush package has all info needed to send push request
                webpush.setVapidDetails('mailto:koko.webdev@gmail.com', 'BA-AHawLJBoI6MkXvK6gjDslfwMsjusr0KRLBrh3AbJ-z6UCedN2zyevMZZCnf6suMSHB9Z8mgHhDCisXClYrr8', 'CfM2TIKwS7jnD9lbuP_xJInloQiICRf36AoMTCQS82o');

                // Send Push Request to all Subscriptions
                // Access the Database using the Node Name we set up 'subscriptions'
                // First Step:  Fetch the Subscriptions Node,
                // Use once() to only fetch data once and not set up a permanent listener
                return admin.database().ref('subscriptions').once('value')
                
                /*
                    // the following is replaced by the above return
                // Here we have already successfully stored something in the database,
                // Start sending the Push Notification
                response.status(201).json({
                    message: 'Data stored',
                    id: request.body.id
                });
                return null;*/
            })
            .then(function (subscriptions) {
                // Send out the Push Messages
                subscriptions.forEach(function(subscription) {
                    // This is the same output of calling JSON.stringify on a PushSubscription
                    var pushSubscription = {
                        endpoint: subscription.val().endpoint,
                        keys: {
                            auth: subscription.val().keys.auth,
                            p256dh: subscription.val().keys.p256dh
                        }
                    };
                    // For each subscription, Send the Notification
                    // Note, the second parameter is the Push Payload Text, which is JSON
                    // returns a promise
                    webpush.sendNotification(pushSubscription, JSON.stringify({title: 'New Post', content: 'New Post Added'}))
                        .catch(function (err) {
                            console.log(err);
                        });

                    response.status(201).json({
                        message: 'Data stored',
                        id: request.body.id
                    });
                    
                }) // end forEach
            })
            .catch(function(err) {
                response.status(500).json({
                    error: err,
                    message: 'Error 500'
                });
            });
    });
});

