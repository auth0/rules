function redirectToUpdateProfileWebsite(user, context, callback) {
  const RULE_NAME = 'redirect-to-update-profile-website';
  const jwt = require('jsonwebtoken');

  user.user_metadata = user.user_metadata || {};
  
  // skip if returning from the profile site
  if (context.protocol === "redirect-callback") {
    return callback(null, user, context);
  }
  
  const requiredFields = [];

  // check for missing require fields
  if (!user.given_name && !user.user_metadata.given_name) {
    requiredFields.push('given_name');
  }
  if (!user.family_name && !user.user_metadata.family_name) {
    requiredFields.push('family_name');
  }

  // check for progressive desired fields
  if (!user.user_metadata.birthdate && context.stats.loginsCount >= 3) {
    requiredFields.push('birthdate');
  }

  // exit if no missing required fields
  if (requiredFields.length === 0) {   
    console.log(`${RULE_NAME}: ${user.user_id}: No missing required fields`);
    
    return callback(null, user, context);
  }
  
  // generate self-signed JWT for the update profile website
  const options = {
    issuer: configuration.TOKEN_ISSUER,
    audience: configuration.TOKEN_AUDIENCE,
    subject: user.user_metadata.name || user.name || user.email,
    expiresIn: '5 minutes'
  };
  const data = {};
  data[`${configuration.TOKEN_ISSUER}/claims/required_fields`] = requiredFields;
  
  let token;
  try {
    token = jwt.sign(data, configuration.TOKEN_SECRET, options);
  } catch (err) {
    return callback(err);
  }
  
  // redirect to update profile site
  console.log(`${RULE_NAME}: ${user.user_id}: Redirecting to populate missing fields: ${requiredFields}`);
  context.redirect = { 
    url: `${configuration.UPDATE_PROFILE_WEBSITE_URL}?token=${token}`
  };

  callback(null, user, context);    
}
