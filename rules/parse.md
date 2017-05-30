---
short_description: Generate a session token for accessing the Parse API
---
## Generate an Parse Session Token

This rule is used to generate a session token for accessing [Parse API](http://parse.com/). The rule
adds a new `user.parse_session_token` property set to the user profile containing the Parse session token. You can use this `session token` to make further Parse API calls.

The only way of generating a session token is using the [`login`](https://parse.com/docs/rest#users-login) endpoint with a username/password credentials. Since you will be storing users on Auth0, we have to create a rule that uses a long random string with high entropy as a password for all users. You can think of it as a replacement for an API master key to obtain `session tokens`.

If the user doesn't exist, this rule will auto-provision one, with `email`, `name` or `user_id` as the handle.

<img src="https://docs.google.com/drawings/d/1vCyhpNkW2rOktXI5bp4sogmR6p8qBqJeJY-A5vfHA8c/pub?w=1219&amp;h=558">

```js
function rule(user, context, callback) {
  // run this only for the Parse application
  // if (context.clientID !== 'PARSE CLIENT ID IN AUTH0') return callback(null, user, context);

  var PARSE_APP_ID = 'PLACE HERE YOUR PARSE APP ID';
  var PARSE_API_KEY = 'PLACE HERE YOUR PARSE REST API KEY';
  var PARSE_USER_PASSWORD = 'PARSE_USER_MASTER_KEY'; // you can use this to generate one http://www.random.org/strings/

  var username = user.email || user.name || user.user_id; // this is the Auth0 user prop that will be mapped to the username in the db

  request.get({
    url: 'https://api.parse.com/1/login',
    qs: {
      username: username,
      password: PARSE_USER_PASSWORD
    },
    headers: {
      'X-Parse-Application-Id': PARSE_APP_ID,
      'X-Parse-REST-API-Key': PARSE_API_KEY
    }
  },
  function (err, response, body) {
    if (err) return callback(err);

    // user was found, add sessionToken to user profile
    if (response.statusCode === 200) {
      context.idToken['https://example.com/parse_session_token'] = JSON.parse(body).sessionToken;
      return callback(null, user, context);
    }

    // Not found. Likely the user doesn't exist, we provision one
    if(response.statusCode === 404) {
      request.post({
        url: 'https://api.parse.com/1/users',
        json: {
          username: username,
          password: PARSE_USER_PASSWORD
        },
        headers: {
          'X-Parse-Application-Id': PARSE_APP_ID,
          'X-Parse-REST-API-Key': PARSE_API_KEY,
          'Content-Type': 'application/json'
        }
      },
      function (err, response, body) {
        if (err) return callback(err);

        // user created, add sessionToken to user profile
        if (response.statusCode === 201) {
          context.idToken['https://example.com/parse_session_token'] = body.sessionToken;
          return callback(null, user, context);
        }
        return callback(new Error('The user provisioning returned an unkonwn error. Body: ' + JSON.stringify(body)));
      });
    }
    else
    {
      return callback(new Error('The login returned an unkonwn error. Status: ' + response.statusCode + 'Body: ' + body));
    }
  });
}

```
