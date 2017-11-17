---
gallery: true
short_description: Trigger multifactor authentication with Google Authenticator when a condition is met
categories:
- multifactor
---

## Multifactor with Google Authenticator

This rule is used to trigger multifactor authentication with Google Authenticator when a condition is met.

Upon first login, the user can enroll the device by scanning a QR code. Subsequent logins will ask for the Google Authenticator code.

To reset Google Authenticator for a user, you can go to Users, search for the specific user and click on Actions -> Multifactor.

```js
function (user, context, callback) {
  // Uncomment the following to skip MFA when impersonating a user
  // if (user.impersonated) { return callback(null, user, context); }

  var CLIENTS_WITH_MFA = ['REPLACE_WITH_YOUR_CLIENT_ID'];
  // run only for the specified clients
  if (CLIENTS_WITH_MFA.indexOf(context.clientID) !== -1) {
    // uncomment the following if clause in case you want to request a second factor only from users that have app_metadata.use_mfa === true
    // if (user.app_metadata && user.app_metadata.use_mfa){
      context.multifactor = {
        provider: 'google-authenticator',

        // optional
        // issuer: 'Label on Google Authenticator App', 

        // optional, defaults to true. Set to false to force Google Authenticator every time. 
        // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
        allowRememberBrowser: false 
      };
    // }
  }

  callback(null, user, context);
}
```
