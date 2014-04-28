## Generate an Appery.io Session Token

This rule is used to generate a session token for accessing [Appery.io Database Services](http://appery.io/). The rule
adds a new `user.appery_session_token` property set to the user profile containing the Appery.io session token. Yuo can use this `session token` to make further Appery.io API calls.

The only way of generating a session token is using the [`login`](http://docs.appery.io/documentation/users-rest-api/) endpoint with a username/password credentials. Since you will be storing users on Auth0, we have to create a rule that uses a long random string with high entropy as a password for all users. You can think of it as a replacement for an API master key to obtain `session tokens`. Nobody can see this password since it's hashed on Appery's database. You could rotate it, but in this case, make sure you update the existing users.

More information is available in the Appery API: http://docs.appery.io/documentation/backendservices/database/#Signing_in_login

If the user doesn't exist, this rule will auto-provision one, with `email`, `name` or `user_id` as the handle.

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
      user.appery_userId = JSON.parse(body)._id;
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
          user.appery_userId = body._id;
          return callback(null, user, context);
        }

        return callback(new Error('The login returned an unknown error. Body: ' + body));

      });
    }
  });

}
```
