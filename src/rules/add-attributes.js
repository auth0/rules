/**
 *
 * This rule will add an attribute to the user only for the login transaction (i.e. they won't be persisted to the user).
 *
 * This is useful for cases where you want to enrich the user information for a specific application.
 *
 * @title Add attributes to a user for specific connection
 * @overview Add attributes to a user for specific connection.
 * @gallery true
 * @category enrich profile
 */

function addAttributes(user, context, callback) {
  if (context.connection === 'company.com') {
    context.idToken['https://example.com/vip'] = true;
  }

  callback(null, user, context);
}
