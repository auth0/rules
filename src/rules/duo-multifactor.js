/**
 * @title Multifactor with Duo Security
 * @overview Trigger multifactor authentication with Duo Security when a condition is met.
 * @gallery true
 * @category multifactor
 *
 * This rule is used to trigger multifactor authentication with [Duo Security](http://duosecurity.com) when a condition is met.
 *
 * Upon first login, the user can enroll the device.
 *
 * You need to create two __integrations__ in __Duo Security__: one of type __WebSDK__ and the other __Admin SDK__.
 *
 */

function duoMultifactor(user, context, callback) {
  var CLIENTS_WITH_MFA = ["REPLACE_WITH_YOUR_CLIENT_ID"];
  // run only for the specified clients
  if (CLIENTS_WITH_MFA.indexOf(context.clientID) !== -1) {
    // uncomment the following if clause in case you want to request a second factor only from user's that have user_metadata.use_mfa === true
    // if (user.user_metadata && user.user_metadata.use_mfa){
    context.multifactor = {
      //required
      provider: "duo",
      ikey: configuration.DUO_IKEY,
      skey: configuration.DUO_SKEY,
      host: configuration.DUO_HOST, // e.g.: 'api-XXXXXXXX.duosecurity.com',

      // optional, defaults to true. Set to false to force DuoSecurity every time.
      // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
      allowRememberBrowser: false

      // optional. Use some attribute of the profile as the username in DuoSecurity. This is also useful if you already have your users enrolled in Duo.
      // username: user.nickname
    };
    // }
  }

  callback(null, user, context);
}
