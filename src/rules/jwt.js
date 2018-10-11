/**
 * @title Generate a JSON Web Token
 * @overview Generate a signed JSON Web Token based on the `user` object.
 * @category token
 *
 * This rule generates a signed JSON Web Token based on the `user` object. Useful when using other protocols like SAML or WS-Federation and you need to call a downstream API that accepts JSON Web Tokens. The `id_token` will be part of the user profile, which will be translated to a SAML Attribute.
 *
 */

function (user, context, callback) {
  const jwt = require('jsonwebtoken');
  const CLIENT_SECRET = configuration.TARGET_API_CLIENT_SECRET;
  const CLIENT_ID = configuration.TARGET_API_CLIENT_ID;

  //Copies user profile attributes needed in the API (equivalent to `scope`)
  const api_user = {
  	user_id: user.user_id,
  	email: user.email,
  	name: user.name
  };

  const options = {
  	subject: user.user_id,
    expiresIn: '10h', //Should be greater than the SAML token expiration
  	audience: CLIENT_ID,
  	issuer: 'https://{your auth0 account}.auth0.com'
  };

  context.idToken['https://example.com/id_token'] = jwt.sign(api_user,
  						   Buffer.from(CLIENT_SECRET, 'base64'),
  						   options);

  callback(null, user, context);
}
