/**
 * @overview Disable signups from social connections.
 * @gallery true
 * @category access control
 * 
 * Disable social signups
 * 
 * This rule is used to prevent signups using social connections.
 * 
 */

function (user, context, callback) {

  const CLIENTS_ENABLED = ['REPLACE_WITH_YOUR_CLIENT_ID'];
  // run only for the specified clients
  if (CLIENTS_ENABLED.indexOf(context.clientID) === -1) {
    return callback(null, user, context);
  }

  // initialize app_metadata
  user.app_metadata = user.app_metadata || {};
  
  // if it is the first login (hence the `signup`) and it is a social login
  if (context.stats.loginsCount === 1 && user.identities[0].isSocial) {
    
    // turn on the flag
    user.app_metadata.is_signup = true; 
    
    // store the app_metadata
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        // throw error
        return callback(new Error('Signup disabled'));
      })
      .catch(function(err){
        callback(err);
      });
    
    return;
  }
  
  // if flag is enabled, throw error
  if (user.app_metadata.is_signup) {
    return callback(new Error('Signup disabled'));
  }
  
  // else it is a non social login or it is not a signup
  callback(null, user, context);
}
