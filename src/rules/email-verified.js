/**
 * @title Force email verification
 * @overview Only allow access to users with verified emails.
 * @gallery true
 * @category access control
 *
 * This rule will only allow access users that have verified their emails.
 *
 * > Note: It might be a better UX to make this verification from your application.
 *
 * If you are using [Lock](https://auth0.com/docs/lock), the default behavior is to log in a user immediately after they have signed up.
 * To prevent this from immediately displaying an error to the user, you can pass the following option to `lock.show()` or similar: `loginAfterSignup: false`.
 *
 * If you are using [auth0.js](https://auth0.com/docs/libraries/auth0js), the equivalent option is `auto_login: false`.
 *
 */

function emailVerified(user, context, callback) {
  if (!user.email_verified) {
    return callback(
      new UnauthorizedError('Please verify your email before logging in.')
    );
  } else {
    return callback(null, user, context);
  }
}
