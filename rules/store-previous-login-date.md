---
gallery: true
categories:
- enrich profile
---

## Store previous login date

This rule will add two properties to the user profile: `previousLogin` and `latestLogin`, which can be used to tell when a user had previously logged in.
If the user is logging in for the first time, then `previousLogin` and `latestLogin` will be set to the same value.
`latestLogin` can be used like a regular property, unlike `lastLogin` which is an internal property and cannot be specified in scopes when requesting a JWT.

```js
function (user, context, callback) {
  user.persistent.previousLogin = user.latestLogin || new Date();
  user.persistent.latestLogin = new Date();
  callback(null, user, context);
}
```
