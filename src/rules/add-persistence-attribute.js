/**
 * @overview Set the default color of a user's user_metadata field.
 * @gallery true
 * @category enrich profile
 * 
 * Add persistent attributes to the user
 * 
 * This rule count set the default color (an example preference) to a user (using user_metadata`).
 * 
 */

function (user, context, callback) {
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.color = user.user_metadata.color || 'blue';
  context.idToken['https://example.com/favorite_color'] = user.user_metadata.color;

  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function(){
        callback(null, user, context);
    })
    .catch(function(err){
        callback(err);
    });
}
