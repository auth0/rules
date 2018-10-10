/**
 * @title Generate an Appery.io Session Token
 * @overview Generate a session token for accessing Appery.io Database Services.
 *
 * This rule is used to generate a session token for accessing [Appery.io Database Services](http://appery.io/). The rule
 * adds a new `user.apperyio_session_token` property set to the user profile containing the Appery.io session token. You can use this `session token` to make further Appery.io API calls.
 * The only way of generating a session token is using the [`login`](http://docs.appery.io/documentation/users-rest-api/) endpoint with a username/password credentials. Since you will be storing users on Auth0, we have to create a rule that uses a long random string with high entropy as a password for all users. You can think of it as a replacement for an API master key to obtain `session tokens`. Nobody can see this password since it's hashed on Appery.io database. You could rotate it, but in this case, make sure you update the existing users.
 * More information is available in the Appery.io API: http://docs.appery.io/documentation/backendservices/database/#Signing_in_login
 * If the user doesn't exist, this rule will auto-provision one, with `email`, `name` or `user_id` as the handle.
 *
 */

function (user, context, callback) {
  // run this only for the Appery.io application
  // if (context.clientID !== 'APPERYIO CLIENT ID IN AUTH0') return callback(null, user, context);

  const APPERYIO_DATABASE_ID = configuration.APPERYIO_DATABASE_ID;
  const PASSWORD_SECRET = configuration.APPERYIO_PASSWORD_SECRET; // you can use this to generate one http://www.random.org/strings/
  const username = user.email || user.name || user.user_id; // this is the Auth0 user prop that will be mapped to the username in the db

  request.get({
    url: 'https://api.appery.io/rest/1/db/login',
    qs: {
      username: username,
      password: PASSWORD_SECRET
    },
    headers: {
      'X-Appery-Database-Id': APPERYIO_DATABASE_ID
    },
    json: true
  },
  (err, response, body) => {
    if (err) return callback(err);

    // user was found, add sessionToken to user profile
    if (response.statusCode === 200) {
      context.idToken['https://example.com/apperyio_session_token'] = body.sessionToken;
      context.idToken['https://example.com/apperyio_user_id'] = body._id;
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
          'X-Appery-Database-Id': APPERYIO_DATABASE_ID
        }
      },
      (err, response, body) => {
        if (err) return callback(err);

        // user created, add sessionToken to user profile
        if (response.statusCode === 200) {
          context.idToken['https://example.com/apperyio_session_token'] = body.sessionToken;
          context.idToken['https://example.com/apperyio_user_id'] = body._id;
          return callback(null, user, context);
        }

        return callback(new Error('The login returned an unknown error. Body: ' + body));

      });
    }
  });
}
