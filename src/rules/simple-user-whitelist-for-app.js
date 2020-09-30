/**
 * @title Whitelist for a Specific App
 * @overview Only allow access to users with whitelist email addresses on a specific app
 * @gallery true
 * @category access control
 *
 * This rule will only allow access to users with specific email addresses on a specific app.
 *
 */

function userWhitelistForSpecificApp(user, context, callback) {
  // Access should only be granted to verified users.
  if (!user.email || !user.email_verified) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  // only enforce for NameOfTheAppWithWhiteList
  // bypass this rule for all other apps
  if (context.clientName !== 'NameOfTheAppWithWhiteList') {
    return callback(null, user, context);
  }

  const whitelist = ['user1@example.com', 'user2@example.com']; // authorized users
  const userHasAccess = whitelist.some(function (email) {
    return email === user.email;
  });

  if (!userHasAccess) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  callback(null, user, context);
}
