/**
 * @title Detect if the email address of the user has a poor confidence score
 * @overview Look up in Auth0 Email Signals (https://auth0.com/signals) and store the score in the user's metadata.
 * @gallery true
 * @category access control
 *
 * This rule query to the Auth0 Email Signals API about the email of the user 
 * and running a confidence score algorithm. The result is stored in the 
 * user's metadata for further analysis.
 * 
 * > Note: You should sign up first in Auth0 Signals (https://auth0.com/signals)
 * and copy the API Key given into a setting key named AUTH0SIGNALS_API_KEY.
 *
 */
function getBadEmailDetection(user, context, callback) {

    // skip if no email
    if (!user.email) return callback(null, user, context);
  
    user.user_metadata = user.user_metadata || {};
  
    const request = require('request');
    
    console.log('Preparing request to Auth0-Signals');
    request({
      url: 'https://signals.api.auth0.com/bademail/' + user.email + '?timeout=0',
      qs: {
        token:  configuration.AUTH0SIGNALS_API_KEY
      },
      headers: {
        'content-type': 'application/json'
      }
    }, function (err, resp, body) {
      if (err) return callback(null, user, context);
      if (resp.statusCode !== 200) return callback(null, user, context);
      const signals_response = JSON.parse(body);
  
      user.user_metadata.email = user.user_metadata.email || {};
  
      // the full JSON object returned can be found here: https://auth0.com/signals/docs/#email
      user.user_metadata.email = signals_response.response;
    
      // persist the user_metadata update
      auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
        .then(function(){
            context.idToken['https://example.com/email'] = user.user_metadata.email;
            console.log(user);
            callback(null, user, context);
        })
        .catch(function(err){
            console.log(err);
            callback(err);
        });
    });
  }