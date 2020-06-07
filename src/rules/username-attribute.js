/**
 * @title Add Username to AppMetadata 
 * @overview Adds metadata on when an user first signs up or logs in. 
 * @gallery true
 * @category enrich profile
 *
 * This rule will add one attribute to the user's metadata object on when they log in or sign up
 *
 * This is useful for cases where you want to add the username to an email using liquid syntax.
 */
 
function (user, context, callback) {
    user.app_metadata = user.app_metadata || {};
    // short-circuit if the user signed up already
    if (user.app_metadata.username) return callback(null, user, context);
    // first time login/signup
    user.app_metadata.username = user.app_metadata.username || user.username;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
          callback(null, user, context);
      })
      .catch(function(err){
          callback(err);
      });
  }
