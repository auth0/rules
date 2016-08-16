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
        provider: 'guardian', //required

        ignoreCookie: true, // optional. Force Auth0 MFA everytime this rule runs. Defaults to false. if accepted by users the cookie lasts for 30 days (this cannot be changed)
      };
  }

  callback(null, user, context);
}
```
