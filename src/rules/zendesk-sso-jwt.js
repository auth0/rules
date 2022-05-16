/**
 *
 * The specific details for how this works can be read here: https://support.zendesk.com/hc/en-us/articles/203663816-Setting-up-single-sign-on-with-JWT-JSON-Web-Token-
 *
 * This rule assumes you've set a configuration variable named `ZENDESK_JWT_SECRET`.
 *
 * When the user authenticates, redirect to the URL returned in the `https://example.com/zendesk_jwt_url` claim, optionally adding the `return_to` query string parameter.
 *
 * @title Zendesk SSO for users using JWT
 * @overview Zendesk SSO for users using JWT.
 * @gallery false
 * @category access control
 */

function zendeskSsoWithJwt(user, context, callback) {
  const jwt = require('jsonwebtoken');
  const uuid = require('uuid');

  const ZENDESK_SUBDOMAIN = 'auth0sso';

  const payload = {
    iat: new Date().getTime() / 1000,
    jti: uuid(),
    email: user.email,
    name: user.name,
    external_id: user.user_id
  };

  const zendesk_token = jwt.sign(payload, configuration.ZENDESK_JWT_SECRET);
  context.idToken['https://example.com/zendesk_jwt_url'] =
    'https://' +
    ZENDESK_SUBDOMAIN +
    '.zendesk.com/access/jwt?jwt=' +
    zendesk_token;

  callback(null, user, context);
}
