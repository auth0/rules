Simple rule to add a `jti` to your outgoing token:

```js
function (user, context, callback) {
  context.jwtConfiguration.scopes = context.jwtConfiguration.scopes || {};
  context.jwtConfiguration.scopes.openid = [ "openid", "jti" ];
  
  user.jti = require('uuid').v4();

  callback(null, user, context);
}
```
