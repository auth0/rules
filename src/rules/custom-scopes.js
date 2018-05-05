/**
 * @overview Map arbitrary `scope` values to actual properties in the user profile.
 * @gallery true
 * @category access control
 * 
 * Custom authorization scopes
 * 
 * This rule maps arbitrary `scope` values to actual properties in the user profile.
 * 
 */

function (user, context, callback) {
  // The currently requested scopes can be accessed as follows:
  // context.request.query.scope.match(/\S+/g)
  const scopeMapping = {
    contactInfo: ["name", "email", "company"],
    publicInfo: ["public_repos", "public_gists"]
  };
  context.jwtConfiguration.scopes = scopeMapping;
  callback(null, user, context);
}
