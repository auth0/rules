/**
 * @overview Get the user locations based on IP address and add to the app_metadata in the geoip attribute
 * @gallery true
 * @category enrich profile
 * 
 * Enrich profile with the locations where the user logs in
 * 
 * This rule gets the user locations based on the IP and is added to the `user_metadata` in the `geoip` attribute.
 * 
 */

function (user, context, callback) {
  
  user.user_metadata = user.user_metadata || {};
  
  user.user_metadata.geoip = context.request.geoip;
  
  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function(){
      context.idToken['https://example.com/geoip'] = context.request.geoip;
      callback(null, user, context);
    })
    .catch(function(err){
      callback(err);
    });
}
