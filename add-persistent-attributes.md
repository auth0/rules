## Add persistent attributes to the user

This rule count the amount of login for each user and store it as a persistent property (i.e. metadata).

```js
function (user, context, callback) {
  user.loginCount = ++user.loginCount || 1;

  //this makes the property persistent
  user.persistent.loginCount = user.loginCount;

  callback(null, user, context);
}
```
