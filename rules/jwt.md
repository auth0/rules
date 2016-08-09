---
short_description: Generate a signed JSON Web Token based on the `user` object.
---
## Generate a JSON Web Token

This rule generates a signed JSON Web Token based on the `user` object. Useful when using other protocols like SAML or WS-Federation and you need to call a downstream API that accepts JSON Web Tokens. The `id_token` will be part of the user profile, which will be translated to a SAML Attribute.


```js
function (user, context, callback) {
  var CLIENT_SECRET = 'TARGET_API_CLIENT_SECRET';
  var CLIENT_ID = 'TARGET_API_CLIENT_ID';

  //Copies user profile attributes needed in the API (equivalent to `scope`)
  var api_user = {
  	user_id: user.user_id,
  	email: user.email,
  	name: user.name
  };

  var options = {
  	subject: user.user_id,
  	expiresInMinutes: 600, //Should be greater than the SAML token expiration
  	audience: CLIENT_ID,
  	issuer: 'https://{your auth0 account}.auth0.com'
  };

  user.id_token = jwt.sign(api_user, 
  						   new Buffer(CLIENT_SECRET, 'base64'),
  						   options);
  callback(null, user, context);
}
```
