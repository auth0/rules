---
gallery: true
short_description: Only allow access to users with specific whitelist email addresses
categories:
- access control
---
## Whitelist

This rule will only allow access to users with specific email addresses.

```js
function (user, context, callback) {
    var whitelist = [ 'user1@example.com', 'user2@example.com' ]; //authorized users
    var userHasAccess = user.email_verified && whitelist.some(
      function (email) {
        return email === user.email;
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }

    callback(null, user, context);
}
```
