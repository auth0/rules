/**
 *
 * Please see the [EVA Voice Biometrics integration](https://marketplace.auth0.com/integrations/eva-voice-biometrics) for more information and detailed installation instructions.
 *
 * **Optional configuration:**
 *
 *    - `AURAYA_URL` EVA endpoint, typically: https://eva-web.mydomain.com/server/oauth
 *    - `AURAYA_CLIENT_ID` JWT client id on the EVA server (and this server)
 *    - `AURAYA_CLIENT_SECRET` JWT client secret on the EVA server (and this server)
 *    - `AURAYA_ISSUER` This app (or "issuer")
 *    - `AURAYA_RANDOM_DIGITS`Set to "true" to prompt for random digits or "false" not to
 *    - `AURAYA_COMMON_DIGITS` Set to "true" to prompt for common digits or "false" not to
 *    - `AURAYA_PERSONAL_DIGITS` A user.user_metadata property that contains digits such as phone_number
 *    - `AURAYA_COMMON_DIGITS_PROMPT` A digit string to prompt for common digits (e.g '987654321')
 *    - `AURAYA_PERSONAL_DIGITS_PROMPT` A string to prompt for personal digits (e.g 'your cell number')
 *    - `AURAYA_DEBUG` Set to "true" to log errors in the console
 *
 * @title EVA Voice Biometric connector
 * @overview EVA Voice Biometric connector rule for Auth0 enables voice enrolment and verification as a second factor
 * @gallery false
 * @category marketplace
 */

function evaVoiceBiometric(user, context, callback) {
  const debug = typeof configuration.AURAYA_DEBUG !== 'undefined';
  if (debug) {
    console.log(user);
    console.log(context);
    console.log(configuration);
  }

  const eva_url =
    configuration.AURAYA_URL ||
    'https://eval-eva-web.aurayasystems.com/server/oauth';
  const clientSecret =
    configuration.AURAYA_CLIENT_SECRET ||
    'o4X0LFKi2caP5ipUwaF4B27cZmfOIh0JXnqmfiC4mHkVskSzbp72Emk3AB6';
  const clientId = configuration.AURAYA_CLIENT_ID || 'auraya';
  const issuer = configuration.AURAYA_ISSUER || 'issuer';

  // Prepare user's enrolment status
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.auraya_eva = user.user_metadata.auraya_eva || {};

  // User has initiated a login and is prompted to use voice biometrics
  // Send user's information and query params in a JWT to avoid tampering
  function createToken(user) {
    const options = {
      expiresInMinutes: 2,
      audience: clientId,
      issuer: issuer
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
    if (debug) {
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

  let personalDigits = '';
  if (typeof configuration.AURAYA_PERSONAL_DIGITS !== 'undefined') {
    personalDigits = user.user_metadata[configuration.AURAYA_PERSONAL_DIGITS];
  }

  // default value for these is 'true'
  const commonDigits = configuration.AURAYA_COMMON_DIGITS || 'true';
  const randomDigits = configuration.AURAYA_RANDOM_DIGITS || 'true';

  // default value for these is '' (the server default)
  const commonDigitsPrompt = configuration.AURAYA_COMMON_DIGITS_PROMPT || ''; // 123456789
  const personalDigitsPrompt =
    configuration.AURAYA_PERSONAL_DIGITS_PROMPT || ''; // 'your phone number'

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
    url: `${eva_url}?token=${token}`
  };

  return callback(null, user, context);
}
