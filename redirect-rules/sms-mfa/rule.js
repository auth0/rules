function performSmsMfa (user, context, callback) {
  var jwt = require('jsonwebtoken');

  //check SMS MFA is enabled for the client
  var CLIENTS_WITH_MFA = ['REPLACE_WITH_YOUR_CLIENT_ID'];

  // run only for the specified clients
  if (CLIENTS_WITH_MFA.indexOf(context.clientID) === -1) {
    return callback(null, user, context);
  }

  //Returning from MFA validation
  if(context.protocol === 'redirect-callback') {
    var decoded = jwt.verify(context.request.query.id_token, Buffer.from(configuration.SMS_MFA_TOKEN_SECRET, 'base64'));
    if(!decoded) return callback(new Error('Invalid Token'));
    if(decoded.status !== 'ok') return callback(new Error('Invalid Token Status'));

    return callback(null, user, context);
  }

  //CHECK FOR SMS IDENTITY
  var sms_connections = user.identities.filter(function (id) {
    return id.provider === 'sms' && id.profileData && id.profileData.phone_verified;
  });
  var token_payload = {};

  //IF NO SMS IDENTITY, SKIP
  if (sms_connections.length === 0) {
    return callback(null,user,context);
  }

  token_payload.sms_identity = sms_connections[0];

  var token = jwt.sign(token_payload,
    Buffer.from(configuration.SMS_MFA_TOKEN_SECRET, 'base64'),
    {
      subject: user.user_id,
      expiresInMinutes: 15,
      audience: context.clientID,
      issuer: 'urn:auth0:sms:mfa'
    });


  //Trigger MFA
  context.redirect = {
    url: configuration.SMS_MFA_URL + '?token=' + token // check this
  };

  callback(null,user,context);
}
