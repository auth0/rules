/**
 * @overview Add a Roles field to the user based on some pattern
 * @gallery true
 * @category access control
 *
 * Set roles to a user
 *
 * This rule adds a Roles field to the user based on some pattern
 */

function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  const addRolesToUser = function(user, cb) {
    const endsWith = '@example.com';
    if (user.email && (user.email.substring(user.email.length - endsWith.length, user.email.length) === endsWith)) {
      cb(null, ['admin']);
    } else {
      cb(null, ['user']);
    }
  };

  addRolesToUser(user, function(err, roles) {
    if (err) {
      callback(err);
    } else {
      user.app_metadata.roles = roles;
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function(){
          context.idToken['https://example.com/roles'] = user.app_metadata.roles;
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        });
    }
  });
}
