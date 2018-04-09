var functions = require('firebase-functions');

// Access to Database
var admin = require('firebase-admin');

// Send the right headers to access http endpoint from an app running on a different server
var cors = require('cors')({origin: true});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// Initialize the app so that we can access firebase database with admin
// Give location of the Database and the Keyfile from Settings/Project Settings/Service Accounts/ServiceAccount path url
//  to Generate New Private Key.  Link to var serviceAccount
var serviceAccount = require("./breegram-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://breegrams.firebaseio.com/',
    
    
});

exports.storePostData = functions.https.onRequest(function (request, response) {
    cors(request, response, function () {
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        })
            .then(function () {
                response.status(201).json({
                    message: 'Data stored',
                    id: request.body.id
                });

                return null;
            })
            .catch(function(err) {
                response.status(500).json({
                    error: err,
                    message: 'Error 500'
                });
            });
    });
});

