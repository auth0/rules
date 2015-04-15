## Detect whether it's a first time login/signup

This rule will create a persistent property `signed_up` when the user logs in for the first time (i.e. a new user). The next time the user logs in, this rule will be skipped.

```js
function (user, context, callback) {
  // short-circuit if the user signed up already
  if (user.app_metadata.signed_up) return callback(null, user, context);
  
  // first time login/signup
  user.app_metadata.signed_up = true;
    auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function(){
      callback(null, user, context);
    });
    .catch(function(err){
      callback(err);
    });
}
```
