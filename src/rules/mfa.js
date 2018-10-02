/**
 * @overview Trigger multifactor authentication when a condition is met
 * @gallery true
 * @category multifactor
 *
 * Multifactor Authentication
 * This rule is used to trigger multifactor authentication when a condition is met.
 */

function (user, context, callback) {
  /*
  You can trigger MFA conditionally by checking:
  1. Client ID:
  context.clientID === 'REPLACE_WITH_YOUR_CLIENT_ID'
  2. User metadata:
  user_metadata.use_mfa
  */

  // if (<condition>) {
    context.multifactor = {
      provider: 'any',

      // optional, defaults to true. Set to false to force authentication every time.
      // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
      allowRememberBrowser: false
    };
  //}

  callback(null, user, context);
}