/**
 * @overview Only allow access to users coming from a whitelist on specific connection
 * @gallery true
 * @category access control
 *
 * Whitelist on Specific Connection
 *
 * This rule will only allow access to certain users coming from a specific connection (e.g. fitbit).
 */

function (user, context, callback) {

  // Access should only be granted to verified users.
  if (!user.email || !user.email_verified) {
    return callback(null, user, context);
  }

  // We check users only authenticated with 'fitbit'
  if(context.connection === 'fitbit'){
    const whitelist = [ 'user1@example.com', 'user2@example.com' ]; //authorized user emails
    const userHasAccess = whitelist.some(
      function (email) {
        return (email === user.email);
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }
  }

  callback(null, user, context);
}
