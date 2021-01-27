/**
 *	@title EVA Voice Biometric connector
 *	@overview EVA Voice Biometric connector rule for Auth0 enables voice enrolment and verification as a second factor
 *	@gallery true
 *	@category marketplace
 *
 *	EVA WEB is a second-factor voice biometric solution designed for use with a range of web browsers that support audio capture.
 *	The biometric verification process is intended to be part of an authentication flow to enhance security, privacy and ease-of-use.
 *	EVA WEB is an offering from Auraya Systems.
 *
 *	The voice tokens used with EVA WEB are predominantly digit strings, although phrases are also supported.
 *	The usual verification process will usually prompt the user to read out a sequence of random digits,
 *	a sequence of consecutive digits, and optionally their phone number.
 *
 *	The first time a user is directed to EVA WEB where they will be invited to enrol their voice.
 *	This process captures between 3 and 8 utterances depending on the required voice tokens, and includes a biometric “Opt-In” consent step.
 *	At the conclusion of enrolment they will be redirected back to the authentication flow.
 *
 *	Configuration Items:
 *	AURAYA_URL = EVA endpoint, typically: https://eva-web.mydomain.com/server/oauth
 *	AURAYA_CLIENT_ID = JWT client id on the EVA server (and this server)
 *	AURAYA_CLIENT_SECRET = JWT client secret on the EVA server (and this server)
 *	AURAYA_ISSUER = this app (or "issuer")
 *
 *	AURAYA_RANDOM_DIGITS = true|false whether to prompt for random digits
 *	AURAYA_COMMON_DIGITS = true|false whether to prompt for common digits
 *	AURAYA_PERSONAL_DIGITS = a user.user_metadata field that contains digits such as phone_number, or blank
 *
 *	AURAYA_DEBUG = true|false (or blank) controls debug output
 */
function evaVoiceBiometric(user, context, callback) {
  if (
    typeof configuration.AURAYA_DEBUG !== 'undefined' &&
    configuration.AURAYA_DEBUG === 'true'
  ) {
    console.log(user);
    console.log(context);
    console.log(configuration);
  }

  if (
    !configuration.AURAYA_COMMON_DIGITS ||
    !configuration.AURAYA_RANDOM_DIGITS ||
    !configuration.AURAYA_PERSONAL_DIGITS ||
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
    // User was redirected to the /continue endpoint with correct state parameter value

    var options = {
      //subject: user.user_id, // validating the subject is nice to have but not strictly necessary
      jwtid: user.jti
    };

    const payload = jwt.verify(
      context.request.body.token,
      clientSecret,
      options
    );
    if (
      typeof configuration.AURAYA_DEBUG !== 'undefined' &&
      configuration.AURAYA_DEBUG === 'true'
    ) {
      console.log(payload);
    }

    if (payload.reason === 'enrolment_succeeded') {
      user.user_metadata.auraya_eva.status = 'enrolled';

      console.log('Biometric user successfully enrolled');
      // persist the user_metadata update
      auth0.users
        .updateUserMetadata(user.user_id, user.user_metadata)
        .then(function () {
          return callback(null, user, context);
        })
        .catch(function (err) {
          return callback(err);
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

  let personalDigits = '';
  // empty string means do not use personal digits
  // otherwise it is a property of the user.user_metadata object
  // typically "phone_number"
  if (
    typeof configuration.AURAYA_PERSONAL_DIGITS !== 'undefined' &&
    configuration.AURAYA_PERSONAL_DIGITS !== ''
  ) {
    personalDigits = user.user_metadata[configuration.AURAYA_PERSONAL_DIGITS];
  }

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
      commonDigits: configuration.AURAYA_COMMON_DIGITS,
      randomDigits: configuration.AURAYA_RANDOM_DIGITS
    }
  });

  context.redirect = {
    url: `${configuration.AURAYA_URL}?token=${token}`
  };

  return callback(null, user, context);
}