## Remove attributes from a user

Sometimes you don't need every attribute from the user. You can use a rule to delete attributes.

```js
function (user, context, callback) {
  delete user.some_attribute;
  
  // another option would be to define a whitelist of attributes you want, 
  // instead of delete the ones you don't want
  /* 
  var whitelist = ['email', 'name', 'identities'];
  Object.keys(user).forEach(function(key) {
    console.log(whitelist.indexOf(key));
    if (whitelist.indexOf(key) === -1) delete user[key];
  });
  */
  
  callback(null, user, context);
}
```
