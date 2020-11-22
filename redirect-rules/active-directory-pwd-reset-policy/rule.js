function activeDirectoryPasswordResetPolicy(user, context, callback) {
  const jwt = require('jsonwebtoken');

  if (context.connection !== 'FabrikamAD') {
    return callback(null, user, context);
  }

  var ISSUER = 'https://DOMAIN.auth0.com/';
  var CLIENT_ID = 'CLIENT_ID';
  var CLIENT_SECRET = 'CLIENT_SECRET';
  var REDIRECT_TO = 'https://yourcompany.com/tools/pwdreset?token=';
  var MAX_PASSWORD_AGE = 30;

  if (context.protocol !== 'redirect-callback') {

    // Require a password change every X days.
    var last_change_date = getLastPasswordChange(user);
    console.log('Last password change: ' + user.last_pwd_change);
    console.log('Last password change: ' + last_change_date);
    if (dayDiff(last_change_date, new Date()) <= MAX_PASSWORD_AGE) {
      return callback(null, user, context);
    }

    // Create token for the external site.
    var token = createToken(CLIENT_ID, CLIENT_SECRET, ISSUER, {
      sub: user.user_id,
      email: user.email,
      sAMAccountName: user.sAMAccountName,
      ip: context.request.ip
    });

    // Redirect to the external site.
    context.redirect = {
      url: REDIRECT_TO + token
    };

    console.log('Redirecting to: ' +context.redirect.url);
    return callback(null, user, context);
  }
  else
  {
    console.log('User redirected back after password change. Token: ' +
      context.request.query.token);

    // Verify the incoming token.
    verifyToken(CLIENT_ID, CLIENT_SECRET, ISSUER, context.request.query.token,
      function(err, decoded) {
        if (err) {
          console.log('Token error: ' + JSON.stringify(err));
          return callback(new UnauthorizedError('Password change failed.'));
        } else if (decoded.sub !== user.user_id) {
          return callback(
            new UnauthorizedError('Token does not match the current user.'));
        } else if (!decoded.pwd_change) {
          return callback(
            new UnauthorizedError('Invalid token.'));
        }
        else {
          console.log('Decoded token: ' + JSON.stringify(decoded));
          return callback(null, user, context);
        }
      });
  }

  // Get the last password change from AD.
  function getLastPasswordChange(user) {
    var last_change = user.last_pwd_change || 0;
    return new Date((last_change/10000) - 11644473600000);
  }

  // Calculate the days between 2 days.
  function dayDiff(first, second) {
    return (second-first)/(1000*60*60*24);
  }

  // Generate a JWT.
  function createToken(client_id, client_secret, issuer, user) {
    var options = {
      expiresInMinutes: 5,
      audience: client_id,
      issuer: issuer
    };

    var token = jwt.sign(user, Buffer.from(client_secret, 'base64'), options);
    return token;
  }

  // Verify a JWT.
  function verifyToken(client_id, client_secret, issuer, token, cb) {
    var secret = Buffer.from(client_secret, 'base64').toString('binary');
    var token_description = { audience: client_id, issuer: issuer };

    jwt.verify(token, secret, token_description, cb);
  }
}
