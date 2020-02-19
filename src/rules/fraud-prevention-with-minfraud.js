/**
 * @title Fraud Prevention
 * @overview Send the user's IP address, user agent, email address and username in MD5 to MaxMind's MinFraud API.
 *
 * This rule will send the user's IP address, user agent, email address (in MD5) and username (in MD5) to MaxMind's MinFraud API. This API will return information about this current transaction like the location, a risk score, ...
 *
 * > Note: You will need to sign up here to get a license key https://www.maxmind.com/
 *
 */

function fraudPreventionWithMinfraud(user, context, callback) {
  const querystring = require('querystring');
  const request = require('request');
  const crypto = require('crypto');

  const MINFRAUD_API = 'https://minfraud.maxmind.com/app/ccv2r';

  const data = {
    i: context.request.ip,
    user_agent: context.request.userAgent,
    license_key: configuration.MINFRAUD_LICENSE_KEY,
    emailMD5: user.email &&
        crypto.createHash('md5').update(user.email).digest("hex") || null,
    usernameMD5: user.username &&
        crypto.createHash('md5').update(user.username).digest("hex") || null
  };

  request.post(MINFRAUD_API, { form: data, timeout: 3000 }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const result = querystring.parse(body, ';');

      console.log(`Fraud response: ${JSON.stringify(result, null, 2)}`);

      if (result.riskScore && (result.riskScore * 100) > 20) {
        return callback(new UnauthorizedError('Fraud prevention!'));
      }
    }

    if (err) {
      console.log(`Error while attempting fraud check: ${err.message}`);
    }
    if (res.statusCode !== 200) {
      const message = err && err.message;
      console.log(`Unexpected error while attempting fraud check: ${message}`);
    }

    // If the service is down, the request failed, or the result is OK just continue.
    return callback(null, user, context);
  });
}
