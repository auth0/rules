/**
 *	@title EVA Voice Biometric connector
 *	@overview EVA Voice Biometric connector rule for Auth0 enables voice enrolment and verification as a second factor
 *	@gallery true
 *	@category marketplace
 *
 *	Configuration Items:
 *	AURAYA_URL = EVA endpoint, typically: https://eva-web.mydomain.com/server/oauth
 *	AURAYA_CLIENT_ID = JWT client id on the EVA server (and this server)
 *	AURAYA_CLIENT_SECRET = JWT client secret on the EVA server (and this server)
 *	AURAYA_ISSUER = this app (or "issuer")
 *
 *  Optional configuration items:
 *	AURAYA_RANDOM_DIGITS = optional. true|false whether to prompt for random digits
 *	AURAYA_COMMON_DIGITS = optional. true|false whether to prompt for common digits
 *	AURAYA_PERSONAL_DIGITS = optional. a user.user_metadata property that contains digits such as phone_number
 
 *	AURAYA_COMMON_DIGITS_PROMPT = optional. a digit string to prompt for common digits (e.g '987654321')
 *	AURAYA_PERSONAL_DIGITS_PROMPT = optional. a string to prompt for personal digits (e.g 'your cell number')
 *
 *	AURAYA_DEBUG = optional. true|false  controls detailed debug output
 */
function evaVoiceBiometric(user, context, callback) {
  if (typeof configuration.AURAYA_DEBUG !== 'undefined') {
    console.log(user);
    console.log(context);
    console.log(configuration);
  }

  if (
    !configuration.AURAYA_URL ||
    !configuration.AURAYA_CLIENT_ID ||
    !configuration.AURAYA_CLIENT_SECRET ||
    !configuration.AURAYA_ISSUER
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const clientSecret = configuration.AURAYA_CLIENT_SECRET;

  // Prepare user's enrolment status
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.auraya_eva = user.user_metadata.auraya_eva || {};

  // User has initiated a login and is prompted to use voice biometrics
  // Send user's information and query params in a JWT to avoid tampering
  function createToken(user) {
    const options = {
      expiresInMinutes: 2,
      audience: configuration.AURAYA_CLIENT_ID,
      issuer: configuration.AURAYA_ISSUER
    };

    return jwt.sign(user, clientSecret, options);
  }

  if (context.protocol === 'redirect-callback') {
    // user was redirected to the /continue endpoint with correct state parameter value

    var options = {
      //subject: user.user_id, // validating the subject is nice to have but not strictly necessary
      jwtid: user.jti // unlike state, this value can't be spoofed by DNS hacking or inspecting the payload
    };

    const payload = jwt.verify(
      context.request.body.token,
      clientSecret,
      options
    );
    if (typeof configuration.AURAYA_DEBUG !== 'undefined') {
      console.log(payload);
    }

    if (payload.reason === 'enrolment_succeeded') {
      user.user_metadata.auraya_eva.status = 'enrolled';

      console.log('Biometric user successfully enrolled');
      // persist the user_metadata update
      auth0.users
        .updateUserMetadata(user.user_id, user.user_metadata)
        .then(function () {
          callback(null, user, context);
        })
        .catch(function (err) {
          callback(err);
        });

      return;
    }

    if (payload.reason !== 'verification_accepted') {
      // logic to detect repeatedly rejected attempts could go here
      // and update the eva.status accordingly (perhaps with 'blocked')
      console.log(`Biometric rejection reason: ${payload.reason}`);
      return callback(new UnauthorizedError(payload.reason), user, context);
    }

    // verification accepted
    console.log('Biometric verification accepted');
    return callback(null, user, context);
  }

  const url = require('url@0.10.3');
  user.jti = uuid.v4();
  user.user_metadata.auraya_eva.status =
    user.user_metadata.auraya_eva.status || 'initial';
  const mode =
    user.user_metadata.auraya_eva.status === 'initial' ? 'enrol' : 'verify';

  
  // returns property of the user.user_metadata object, typically "phone_number"
  // default is '', (server skips this prompt)
  const personalDigits = 
    typeof configuration.AURAYA_PERSONAL_DIGITS === 'undefined'? ''
      : user.user_metadata[configuration.AURAYA_PERSONAL_DIGITS];

  // default value for these is 'true'
  const commonDigits =
    typeof configuration.AURAYA_COMMON_DIGITS === 'undefined'? 'true'
      : configuration.AURAYA_COMMON_DIGITS;
  const randomDigits =
    typeof configuration.AURAYA_RANDOM_DIGITS === 'undefined'? 'true'
      : configuration.AURAYA_RANDOM_DIGITS;
      
  // default value for these is '' (the server default)
  const commonDigitsPrompt =
    typeof configuration.AURAYA_COMMON_DIGITS_PROMPT === 'undefined'? '' // 123456789
      : configuration.AURAYA_COMMON_DIGITS_PROMPT;
  const personalDigitsPrompt =
    typeof configuration.AURAYA_PERSONAL_DIGITS_PROMPT === 'undefined'? '' // 'your phone number'
      : configuration.AURAYA_PERSONAL_DIGITS_PROMPT;

  const token = createToken({
    sub: user.user_id,
    jti: user.jti,
    oauth: {
      state: '', // not used in token, only in the GET request
      callbackURL: url.format({
        protocol: 'https',
        hostname: context.request.hostname,
        pathname: '/continue'
      }),
      nonce: user.jti // performs same function as jti
    },
    biometric: {
      id: user.user_id, // email - can be used for identities that cross IdP boundaries
      mode: mode,
      personalDigits: personalDigits,
      personalDigitsPrompt: personalDigitsPrompt,
      commonDigits: commonDigits,
      commonDigitsPrompt: commonDigitsPrompt,
      randomDigits: randomDigits
      
    }
  });

  context.redirect = {
    url: `${configuration.AURAYA_URL}?token=${token}`
  };

  return callback(null, user, context);
}
