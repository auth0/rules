---
gallery: true
categories:
- multifactor
---

## Multifactor with Google Authenticator

This rule is used to trigger multifactor authentication with Google Authenticator when a condition is met.

Upon first login, the user can enroll the device by scanning a QR code. Subsequent logins will ask for the Google Authenticator code.

To reset Google Authenticator for a user, you can go to Users, search for the specific user and click on Actions -> Multifactor.

```js
function (user, context, callback) {

  // optional: run only for a specific client
  // if (context.clientID !== '{CLIENT_ID}') {
  //   /* set context.multifactor here instead */
  // }

  context.multifactor = {
    provider: 'google-authenticator',

    // optional, the key to use for TOTP. by default one is generated for you
    // key: '{YOUR_KEY_HERE}'
    // optional, force Google Authenticator everytime this rule runs. Defaults to false.
    // if accepted by users the cookie lasts for 30 days (this cannot be changed)
    // ignoreCookie: true,
  };

  callback(null, user, context);
}
```