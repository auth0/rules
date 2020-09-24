/**
 * @title Whitelist
 * @overview Only allow access to users with specific whitelist email addresses.
 * @gallery true
 * @category access control
 *
 * This rule will only allow access to users with specific email addresses.
 *
 */

function userWhitelist(user, context, callback) {

  // Access should only be granted to verified users.
  if (!user.email || !user.email_verified) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  const whitelist = [ 'user1@example.com', 'user2@example.com' ]; //authorized users
  const userHasAccess = whitelist.some(
    function (email) {
      return email === user.email;
    });

  if (!userHasAccess) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  callback(null, user, context);
}
