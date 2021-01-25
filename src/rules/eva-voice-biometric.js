/**
*	@title EVA Voice Biometric connector
*	@overview EVA Voice Biometric connector rule for Auth0 enables voice enrolment and verification as a second factor
*	@gallery true
*	@category marketplace
*	@author Auraya Systems 2020
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
*	EVA_URL = EVA endpoint, typically: https://eva-web.mydomain.com/server/oauth
*	CLIENT_ID = JWT client id on the EVA server (and this server)
*	CLIENT_SECRET = JWT client secret on the EVA server (and this server)
*	ISSUER = this app (or "issuer")
*	
*	RANDOM_DIGITS = true|false
*	COMMON_DIGITS = true|false
*	PERSONAL_DIGITS = a user.user_metadata field that contains digits such as phone_number, or blank
*/
function(user, context, callback) {

	console.log(user);
	//console.log(context);
	console.log(configuration);

	var clientSecret = configuration.CLIENT_SECRET;
    
  
	// Prepare Users' enrolment status
	user.user_metadata = user.user_metadata || {};
	user.user_metadata.eva = user.user_metadata.eva || {};


	// User has initiated a login and is prompted to use voice biometrics
	// Send user's information and query params in a JWT to avoid tampering
	function createToken(clientId, clientSecret, issuer, user) {
		const options = {
			expiresInMinutes: 2,
			audience: clientId,
			issuer: issuer
		};

		return jwt.sign(user, clientSecret, options);
	}

	if (context.protocol === "redirect-callback") {
		// User was redirected to the /continue endpoint with correct state parameter value

		var options = {
			//subject: user.user_id, // validating the subject is nice to have but not strictly necessary
			jwtid: user.jti
		};

    var payload = jwt.verify(context.request.body.token, clientSecret, options);
		//console.log(payload);

		if (payload.reason === 'enrolment_succeeded') {
			user.user_metadata.eva.status = 'enrolled';

			console.log('Biometric user successfully enrolled');
			// persist the user_metadata update
			auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
				.then(function() {
					callback(null, user, context);
				})
				.catch(function(err) {
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

	} else {

		const url = require('url@0.10.3');
		user.jti = uuid.v4();
		user.user_metadata.eva.status = user.user_metadata.eva.status || 'initial';
		const mode = (user.user_metadata.eva.status === 'initial') ? 'enrol' : 'verify';
		
		
		var personalDigits = ''; 
		// empty string means do not use personal digits
		// otherwise it is a property of the user.user_metadata object
		// typically "phone_number"
		if (typeof(configuration.PERSONAL_DIGITS) !== 'undefined' && configuration.PERSONAL_DIGITS !== '') {
			personalDigits = user.user_metadata[configuration.PERSONAL_DIGITS];
		}

		const token = createToken(
			configuration.CLIENT_ID,
			clientSecret,
			configuration.ISSUER, {
				sub: user.user_id,
				jti: user.jti,
				oauth: {
					state: '', // not used in token, only in the GET request
					callbackURL: url.format({
						protocol: 'https',
						hostname: auth0.domain,
						pathname: '/continue'
					}),
					nonce: user.jti // performs same function as jti
				},
				biometric: {
					id: user.user_id, // email - can be used for identities that cross IdP boundaries 
					mode: mode,
					personalDigits: personalDigits,
					commonDigits: configuration.COMMON_DIGITS,
					randomDigits: configuration.RANDOM_DIGITS
				}

			}
		);

		
		context.redirect = {
			url: `${configuration.EVA_URL}?token=${token}`
		};
		
		return callback(null, user, context);
	}
}