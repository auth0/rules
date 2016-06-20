---
gallery: true
categories:
- enrich profile
---
## Default picture for null avatars

Here is how to set a default picture for null avatars via a rule. 
Here's an example that does this for email-based logins:

```js
function (user, context, callback) {
  if (user.picture.indexOf('cdn.auth0.com') > -1) {
    var url = require('url');
    var u = url.parse(user.picture, true);
    u.query.d = '<URL TO YOUR DEFAULT PICTURE HERE>';
    delete u.search;
    user.picture = url.format(u);
  }

  callback(null, user, context);
}
```
