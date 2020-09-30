/**
 * @title Multifactor with Auth0 Guardian
 * @overview Trigger multifactor authentication with Auth0 when a condition is met.
 * @gallery true
 * @category multifactor,guardian
 *
 * This rule is used to trigger multifactor authentication with Auth0 when a condition is met.
 *
 * Upon first login, the user can enroll the device.
 *
 */

function guardianMultifactor(user, context, callback) {
  //const CLIENTS_WITH_MFA = ['REPLACE_WITH_YOUR_CLIENT_ID'];

  // run only for the specified clients
  //if (CLIENTS_WITH_MFA.indexOf(context.clientID) !== -1) {

  // uncomment the following if clause in case you want to request a second factor only from user's that have user_metadata.use_mfa === true
  //if (user.user_metadata && user.user_metadata.use_mfa){
  context.multifactor = {
    // required
    provider: "guardian",

    // optional, defaults to true. Set to false to force Guardian authentication every time.
    // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
    allowRememberBrowser: false
  };
  //}
  //}

  callback(null, user, context);
}
