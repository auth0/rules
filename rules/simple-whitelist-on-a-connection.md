---
gallery: true
categories:
- access control
---
## Whitelist on Specific Connection

This rule will only allow access to certain users coming from a specific connection (e.g. fitbit).

```
function (user, context, callback) {

    // We check users only authenticated with 'fitbit'
    if(context.connection === 'fitbit'){

      var whitelist = [ 'user1', 'user2' ]; //authorized users
      var userHasAccess = whitelist.some(
        function (name) {
          return name === user.name;
        });

      if (!userHasAccess) {
        return callback(new UnauthorizedError('Access denied.'));
      }
    }

    callback(null, user, context);
}
```
