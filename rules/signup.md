## Detect whether it's a first time login/signup

This rule will create a persistent property `signed_up` when the user logs in for the first time (i.e. a new user). The next time the user logs in, this rule will be skipped.

```js
function (user, context, callback) {
  // short-circuit if the user signed up already
  if (user.signed_up) return callback(null, user, context);
  
  // first time login/signup
  
  user.persistent.signed_up = true;
  callback(null, user, context);
}
```
