---
gallery: true
short_description: Guardian mfa + authorization extension working together
categories:
- multifactor
- guardian
---

## Multifactor with Auth0 Guardian + Authorization Extension

This rule is used to trigger multifactor authentication with Auth0 for
or more groups on the authorization extension.

Upon first login, the user can enroll the device.

```js
function (user, context, callback) {
  if (!user.app_metadata || !user.app_metadata.authorization ||
  !Array.isArray(user.app_metadata.authorization.groups)) {
    return callback(null, user, context);
  }

  var groups = user.app_metadata.authorization.groups;
  var GROUPS_WITH_MFA = {
    // Add groups that need MFA here
    // Example
    // 'admins': true,
  };

  var needsMFA = !!groups.find(function(group) {
    return GROUPS_WITH_MFA[group];
  });

  if (needsMFA){
      context.multifactor = {
        // required
        provider: 'guardian', //required

        // optional, defaults to true. Set to false to force Guardian authentication every time. 
        // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
        allowRememberBrowser: false
      };
  }

  callback(null, user, context);
}
```
