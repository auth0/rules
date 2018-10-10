/**
 * @title Email domain whitelist
 * @overview Only allow access to users with specific whitelist email domains.
 * @gallery true
 * @category access control
 *
 * This rule will only allow access to users with specific email domains.
 *
 */

function (user, context, callback) {
  const whitelist = ['example.com', 'example.org']; //authorized domains
  const userHasAccess = whitelist.some(
      function (domain) {
        const emailSplit = user.email.split('@');
        return emailSplit[emailSplit.length - 1].toLowerCase() === domain;
      });

  if (!userHasAccess) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  return callback(null, user, context);
}
