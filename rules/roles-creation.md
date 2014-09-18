---
gallery: true
categories:
- access control
---
## Set roles to a user

This rule adds a Roles field to the user based on some pattern

```js
function (user, context, callback) {

  addRolesToUser(user, function(err, roles) {
    if (err) {
      callback(error);
    } else {
      user.persistent.roles = roles;
      callback(null, user, context);
  });
  
  // You can add a Role based on what you want
  // In this case I check domain
  var addRolesToUser = function(user, cb) {
    if (user.email.indexOf('@gonto.com') > -1) {
      cb(null, ['admin']);
    } else {
      cb(null, ['user']);
  }
}
```
