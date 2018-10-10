/**
 * @overview Verify user email with password reset
 * @gallery true
 * @category webhook
 *
 * Verify user email with password reset
 *
 * This rule will set the user's email as verified in the next login sequence after the password is reset successfully.
 */

function (user, context, callback) {
  const request = require('request');
  const userApiUrl = auth0.baseUrl + '/users/';

  // This rule is only for Auth0 databases
  if (context.connectionStrategy !== 'auth0') {
    return callback(null, user, context);
  }

  // Set email verified if a user has already updated his/her password
  if (!user.email_verified && user.last_password_reset) {
    request.patch({
      url: userApiUrl + user.user_id,
      headers: {
        Authorization: 'Bearer ' + auth0.accessToken
      },
      json: { email_verified: true },
      timeout: 5000
    },
    function(err, response, body) {
      // Setting email verified isn't propagated to id_token in this
      // authentication cycle so explicitly set it to true given no errors.
      context.idToken.email_verified = (!err && response.statusCode === 200);

      // Return with success at this point.
      return callback(null, user, context);
    });
  } else {
    return callback(null, user, context);
  }
}
