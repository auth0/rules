---
categories:
- access control
---
## Access denied based on a Dropbox whitelist

This rule denies access to a user based on a list of emails stored in Dropbox.

```js
function (user, context, callback) {
  request.get({
    url: 'https://dl.dropboxusercontent.com/u/21665105/users.txt'
  },
  function (err, response, body) {
    var whitelist = body.split('\r\n');
    var userHasAccess = whitelist.some(
      function (email) {
        return email === user.email;
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }

    callback(null, user, context);
  });
}
```
