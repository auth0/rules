### Generate a JSON Web Token

This rule generates a signed JSON Web Token based on the `user` object. Useful when using other protocols like SAML or WS-Federation and you need to call a downstream API that accepts JSON Web Tokens. The `id_token` will be part of the user profile, which will be translated to a SAML Attribute.

```js
function (user, context, callback) {
  var CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
  user.id_token = jwt.sign(user, new Buffer(CLIENT_SECRET, 'base64'));
  callback(null, user, context);
}
```
