/**
 * @title Enrich profile with the locations where the user logs in
 * @overview Get the user locations based on IP address and add to the app_metadata in the geoip attribute
 * @gallery true
 * @category enrich profile
 *
 * This rule gets the user locations based on the IP and is added to the `user_metadata` in the `geoip` attribute.
 *
 */

function getIp(user, context, callback) {
  user.user_metadata = user.user_metadata || {};

  user.user_metadata.geoip = context.request.geoip;

  auth0.users
    .updateUserMetadata(user.user_id, user.user_metadata)
    .then(() => {
      context.idToken["https://example.com/geoip"] = context.request.geoip;
      callback(null, user, context);
    })
    .catch((err) => {
      callback(err);
    });
}
