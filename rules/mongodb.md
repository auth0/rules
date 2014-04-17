---
categories:
- database
---
## Query mongodb and enrich profile

This rule will query mongodb and add a property to the user.

```js
function (user, context, callback) {
   mongo('mongodb://user:password@server:port/db', function (db) {
    var users = db.collection('users');
    users.findOne({email: user.email}, function (err, mongoUser) {
      if (err) return callback(err);
      if (!mongoUser) return callback(null, user, context);
  
      user.foo = mongoUser.foo;
      callback(null, user, context);
    });  
  });
}
```
