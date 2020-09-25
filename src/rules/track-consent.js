/**
 * @title Track consent from Auth0 Lock
 * @overview Adds metadata on when an user has accepted the terms and conditions from within Auth0's Lock. 
 * @gallery true
 * @category enrich profile
 *
 * This rule will add two attributes to the user's metadata object on when they accepted the terms and conditions. 
 *
 * This is useful for cases where you want to track an user's consent. See https://auth0.com/docs/compliance/gdpr/features-aiding-compliance/user-consent/track-consent-with-lock for more information. 
 *
 */

function trackConsent(user, context, callback) {
  user.user_metadata = user.user_metadata || {};
  // short-circuit if the user signed up already
  if (user.user_metadata.consentGiven) return callback(null, user, context);

  // first time login/signup
  user.user_metadata.consentGiven = true;
  // uncomment to track consentVersion
  // user.user_metadata.consentVersion = "1.9";

  user.user_metadata.consentTimestamp = Date.now();
  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function () {
      callback(null, user, context);
    })
    .catch(function (err) {
      callback(err);
    });
}