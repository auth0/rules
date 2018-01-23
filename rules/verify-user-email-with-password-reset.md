---
gallery: true
short_description: Verify user email with password reset
---
## Verify user email with password reset

This rule will set the user's email as verified in the next login sequence after the password is reset successfully.

```js
function (user, context, callback) {
  var request = require('request@2.56.0');
  var userApiUrl = auth0.baseUrl + '/users/';
  
  // This rule is only for Auth0 databases
  if (context.connectionStrategy !== "auth0") {
    return callback(null, user, context);
  }

  // Set email verified if a user has already updated his/her password
  if (!user.email_verified && user.last_password_reset) {
    request.patch({
      url: userApiUrl + user.user_id,
      headers: {
        Authorization: 'Bearer ' + auth0.accessToken
      },
      json: { "email_verified": true },
      timeout: 5000
    }, 
    function(err, response, body) {
      // Setting email verified isn't propaged to id_token in this 
      // authentication cycle so explicitly set it to true 
      context.idToken.email_verified = true;

      // Always return with success, ignore any management api errors 
      return callback(null, user, context);
    });
  } else {
    return callback(null, user, context);
  }
}
```
