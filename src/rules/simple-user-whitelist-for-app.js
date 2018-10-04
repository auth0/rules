/**
 * @overview Only allow access to users with whitelist email addresses on a specific app
 * @gallery true
 * @category access control
 *
 * Whitelist for a Specific App
 *
 * This rule will only allow access to users with specific email addresses on a specific app.
 */

function (user, context, callback) {
  //we just care about NameOfTheAppWithWhiteList
  //bypass this rule for every other app
  if(context.clientName !== 'NameOfTheAppWithWhiteList'){
    return callback(null, user, context);
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
