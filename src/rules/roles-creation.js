/**
 *
 * This rule adds a Roles field to the user based on some pattern.
 *
 * @title Set roles to a user
 * @overview Add a Roles field to the user based on some pattern.
 * @gallery true
 * @category access control
 */

function setRolesToUser(user, context, callback) {
  // Roles should only be set to verified users.
  if (!user.email || !user.email_verified) {
    return callback(null, user, context);
  }

  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  const addRolesToUser = function (user) {
    const endsWith = '@example.com';

    if (
      user.email &&
      user.email.substring(
        user.email.length - endsWith.length,
        user.email.length
      ) === endsWith
    ) {
      return ['admin'];
    }
    return ['user'];
  };

  const roles = addRolesToUser(user);

  user.app_metadata.roles = roles;
  auth0.users
    .updateAppMetadata(user.user_id, user.app_metadata)
    .then(function () {
      context.idToken['https://example.com/roles'] = user.app_metadata.roles;
      callback(null, user, context);
    })
    .catch(function (err) {
      callback(err);
    });
}
