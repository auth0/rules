---
gallery: true
categories:
- access control
---
## Set roles to a user

This rule adds a Roles field to the user based on some pattern

```js
function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  var addRolesToUser = function(user, cb) {
    if (user.email.indexOf('@gonto.com') > -1) {
      cb(null, ['admin']);
    } else {
      cb(null, ['user']);
    }
  };
    
  addRolesToUser(user, function(err, roles) {
    if (err) {
      callback(err);
    } else {
      user.app_metadata.roles = roles;
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function(){
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        });
    }
  });
}
```
