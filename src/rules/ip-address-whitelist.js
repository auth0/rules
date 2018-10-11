/**
 * @title IP Address whitelist
 * @overview Only allow access to an app from a specific set of IP addresses.
 * @gallery true
 * @category access control
 *
 * This rule will only allow access to an app from a specific set of IP addresses
 *
 */

function (user, context, callback) {
  const whitelist = ['1.2.3.4', '2.3.4.5']; // authorized IPs
  const userHasAccess = whitelist.some(function (ip) {
    return context.request.ip === ip;
  });

  if (!userHasAccess) {
    return callback(new Error('Access denied from this IP address.'));
  }

  return callback(null, user, context);
}
