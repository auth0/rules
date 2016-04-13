---
gallery: true
categories:
- access control
---
## IP Address whitelist

This rule will only allow access to an app from a specific set of IP addresses

```js
function (user, context, callback) {
    var whitelist = ['1.2.3.4', '2.3.4.5']; //authorized IPs
    var userHasAccess = whitelist.some(
      function (ip) {
        return context.request.ip === ip;
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied from this IP address.'));
    }

    return callback(null, user, context);
}
```
