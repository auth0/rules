function continueFromUpdateProfileWebsite(user, context, callback) {
  const _ = require('lodash');
  const RULE_NAME = 'continue-from-update-profile-website';
    
  user.user_metadata = user.user_metadata || {};

  // skip if we're not returning from the update profile site
  if (context.protocol !== "redirect-callback") {
    return callback(null, user, context);
  }
  
  // build complete user profile
  user.user_metadata = Object.assign(user.user_metadata, 
    _.pick(
      context.request.body,
      ['given_name', 'family_name', 'birthdate']));
    
  // update user profile in Auth0
  console.log(`${RULE_NAME}: ${user.user_id}: Updating user profile`);
  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(() => callback(null, user, context))
    .catch((err) => {
      console.log(`${RULE_NAME} ERROR:`, err);
      callback(err);
    });
}
