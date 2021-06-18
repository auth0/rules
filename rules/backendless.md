---
short_description: Generate a user token for accessing Backendless API
---
## Generate Backendless User Token

This rule is used to generate a user token for accessing [Backendless API](http://backendless.com/).
The rule adds a new `userToken` claim property set to the user idToken containing the Backendless user token.
You can use this `session token` to make further Backendless API calls.

The only way of generating a user token is using the [`login`](https://backendless.com/docs/rest/doc.html#users_login) endpoint with a login/password credentials.
Since you will be storing users on Auth0, we have to create a rule that uses a long random string with high entropy as a password for all users.
You can think of it as an extention for an API key to obtain `user tokens`. You could rotate it, but in this case, make sure you update the existing users.

If the user doesn't exist, this rule will auto-provision one

```js
function (user, context, callback) {

  var BACKENDLESS_SERVER_URL = 'https://api.backendless.com';
  var BACKENDLESS_APP_ID = 'PLACE HERE YOUR BACKENDLESS APP ID';

  //It should be an API key with permissions to retrieve users.
  //It's safe to grant permissions for ServerCodeUser Role and
  //specify ServerCode User (Code Runner) API key here
  var BACKENDLESS_API_KEY = 'PLACE HERE YOUR BACKENDLESS CODERUNNER API KEY';

  var appUrl = BACKENDLESS_SERVER_URL + '/' + BACKENDLESS_APP_ID + '/' + BACKENDLESS_API_KEY;

  // you can use http://www.random.org/strings/ to generate one
  var PASSWORD_SECRET = 'A REALLY LONG PASSWORD';

  // this is the Auth0 user prop that will be mapped to the Backendless user identity field in the db
  var userIdentity = user.email; // || user.name || user.user_id;

  if (!userIdentity) {
    //it is possible to get rid of such restriction
    //if you set some other Users table column as user identity
    callback(new Error('email is required for integration with Backendless'));
  }

  function createUser(callback) {
    request.post({
      url: appUrl + '/users/register',
      json: {
        email    : userIdentity,
        password : PASSWORD_SECRET,
      }
    }, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        return callback(error || response.statusCode + ' ' + (body.message || body));
      }

      callback();
    });
  }

  function ensureUserExists(callback) {
    request.get({
      url: appUrl + '/data/Users',
      qs: {
        where: "email='"+ user.email +"'",
      },
      json: true
    }, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        return callback(error || response.statusCode + ' ' + (body.message || body));
      }

      if (body.length > 0) {
        callback();
      } else {
        createUser(callback);
      }
    });
  }

  ensureUserExists(function (error) {
    if (error) {
      return callback(error);
    }

    request.post({
      url: appUrl + '/users/login',
      json: {
       login    : userIdentity,
       password : PASSWORD_SECRET,
      }
    }, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        return callback(error || response.statusCode + ' ' + (body.message || body));
      }

      //Add Backendless userToken claim to the idToken
      //https://auth0.com/docs/tokens/id-token#add-claims-using-rules
      context.idToken['https://api.backendless.com/userToken'] = body['user-token'];

      callback(null, user, context);
    });
  });
}
```
