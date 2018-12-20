/**
 * @title IP Address Blacklist
 * @overview Do not allow access to an app from a specific set of IP addresses.
 * @gallery true
 * @category access control
 *
 * This rule will deny access to an app from a specific set of IP addresses.
 *
 */

function (user, context, callback) {

    var blacklist = ['1.2.3.4', '2.3.4.5'];  // unauthorized IPs
    var notAuthorized = blacklist.some(function (ip) {
        return context.request.ip === ip;
      });

    if (notAuthorized) {
      return callback(new UnauthorizedError('Access denied from this IP address.'));
    }

    return callback(null, user, context);
}
