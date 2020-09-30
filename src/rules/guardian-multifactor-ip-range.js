/**
 * @title Multifactor when request comes from outside an IP range
 * @overview Trigger multifactor authentication when IP is outside the expected range.
 * @gallery true
 * @category multifactor,guardian
 *
 * This rule is used to trigger multifactor authentication when the requesting IP is from outside the corporate IP range.
 */

function guardianMultifactorIpRange(user, context, callback) {
  const ipaddr = require('ipaddr.js');
  const corp_network = '192.168.1.134/26';
  const current_ip = ipaddr.parse(context.request.ip);

  if (!current_ip.match(ipaddr.parseCIDR(corp_network))) {
    context.multifactor = {
      provider: 'guardian',

      // optional, defaults to true. Set to false to force Guardian authentication every time.
      // See https://auth0.com/docs/multifactor-authentication/custom#change-the-frequency-of-authentication-requests for details
      allowRememberBrowser: false
    };
  }

  callback(null, user, context);
}
