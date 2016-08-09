---
gallery: true
short_description: Trigger multifactor authentication with Auth0 when a condition is met
categories:
- multifactor
---

## Multifactor with Auth0 Guardian

This rule is used to trigger multifactor authentication with Auth0 when a condition is met.

Upon first login, the user can enroll the device.

```js
function (user, context, callback) {

  //var CLIENTS_WITH_MFA = ['{REPLACE_WITH_YOUR_CLIENT_ID}'];
  // run only for the specified clients
  // if (CLIENTS_WITH_MFA.indexOf(context.clientID) !== -1) {
    // uncomment the following if clause in case you want to request a second factor only from user's that have user_metadata.use_mfa === true
    // if (user.user_metadata && user.user_metadata.use_mfa){
      context.multifactor = {
        provider: 'guardian', //required

        ignoreCookie: true, // optional. Force Auth0 MFA everytime this rule runs. Defaults to false. if accepted by users the cookie lasts for 30 days (this cannot be changed)
      };
    // }
  //}

  callback(null, user, context);
}
```
