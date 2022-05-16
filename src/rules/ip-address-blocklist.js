/**
 *
 * This rule will deny access to an app from a specific set of IP addresses.
 * 
 * @title IP Address Blocklist
 * @overview Do not allow access to an app from a specific set of IP addresses.
 * @gallery true
 * @category access control
 */

function ipAddressBlocklist(user, context, callback) {
  const blocklist = ['1.2.3.4', '2.3.4.5']; // unauthorized IPs
  const notAuthorized = blocklist.some(function (ip) {
    return context.request.ip === ip;
  });

  if (notAuthorized) {
    return callback(
      new UnauthorizedError('Access denied from this IP address.')
    );
  }

  return callback(null, user, context);
}
