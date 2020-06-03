/**
 * @title Add email to access token
 * @overview Add the authenticated user's email address to the access token.
 * @gallery true
 * @category access control
 *
 * This rule will add the authenticated user's `email` attribute value to the access token.
 *
 *
 */

function (user, context, callback) {
  // This rule adds the authenticated user's email address to the access token.

  var namespace = 'https://example.com/';

  context.accessToken[namespace + 'email'] = user.email;
  return callback(null, user, context);
}
