function redirectToConsentForm (user, context, callback) {
  var hasConsented = user.app_metadata && user.app_metadata.has_consented;

  // redirect to consent form if user has not yet consented
  if (!hasConsented && context.protocol !== 'redirect-callback') {
    context.redirect = {
      url: configuration.CONSENT_FORM_URL +
        // generate random state string that Auth0 will validate when we return
        '&state=' + new Buffer(Math.random().toString()).toString('base64')
    };
  }

  // if user clicked 'I agree' on the consent form, persist it to their profile
  // so they don't get prompted again
  if (context.protocol === 'redirect-callback') {
    if (context.request.body.confirm === 'yes') {
      user.app_metadata = user.app_metadata || {};
      user.app_metadata.has_consented = true;

      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function(){
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        });
    } else {
      callback(new UnauthorizedError('User did not consent!'));
    }
  }

  callback(null, user, context);
}
