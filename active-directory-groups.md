## Access denied based on Active Directory group membership

This rule checks if a user belongs to an AD group and if not, it will return Access Denied.

> Note: you can mix this with `context.clientID` or `clientName` to do it only for specific application

```js
function (user, context, callback) {
    var groupAllowed = 'group1';
    var userHasAccess = user.groups.some(
      function (group) { 
        return groupAllowed === group; 
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }

    callback(null, user, context);
}
```
