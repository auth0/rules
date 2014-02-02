## Generate a Appery Session Token

This rule is used to generate a session token for accessing Appery Database Services. The rule
adds a new `user.appery_session_token` property set to the user profile containing the Appery session token:

The only way of generating a session token is using the `login` endpoint with a username/password. Since you will be storing users on Auth0, we have to create a rule that uses a long random string with high entropy as a password for all users. Think of it as a replacement for an API master key to obtain session tokens. Nobody can see this password since it's hashed on Appery database. You can rotate it, but make sure you update the existing users.

More information is available in the Appery API: http://docs.appery.io/documentation/backendservices/database/#Signing_in_login

```js
function (user, context, callback) {
  // run this only for the Appery application
  // if (context.clientID !== 'APPERY CLIENT ID IN AUTH0') return callback(null, user, context);
  
  var APPERY_DATABASE_ID = '<APPERY_DATABASE_ID>';
  var PASSWORD_SECRET = 'A REALLY LONG PASSWORD';         // you can use this to generate one http://www.random.org/strings/
  var username = user.email || user.name || user.user_id; // this is the Auth0 user prop that will be mapped to the username in the db

  request.get({
    url: 'https://api.appery.io/rest/1/db/login',
    qs: {
      username: username,
      password: PASSWORD_SECRET
    },
    headers: {
      'X-Appery-Database-Id': APPERY_DATABASE_ID
    }
  }, 
  function (err, response, body) {
    if (err) return callback(err);
    
    // user was found, add sessionToken to user profile
    if (response.statusCode === 200) {
      user.appery_session_token = JSON.parse(body).sessionToken;
      return callback(null, user, context);
    }
    
    // user don't exist, create it
    if (response.statusCode === 404) {
      console.log('not found');
      request.post({
        url: 'https://api.appery.io/rest/1/db/users',
        json: {
          username: username,
          password: PASSWORD_SECRET
        },
        headers: {
          'X-Appery-Database-Id': APPERY_DATABASE_ID
        }
      }, 
      function (err, response, body) {
        if (err) return callback(err);

        // user created, add sessionToken to user profile
        if (response.statusCode === 200) {
          user.appery_session_token = body.sessionToken;
          return callback(null, user, context);
        }

      });
    }
  });

}
```
