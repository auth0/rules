/**
 * @title User metadata for Cumul.io
 * @overview Add Cumul.io user metadata to tokens to be used for Cumul.io dashboard filtering
 * @gallery true
 * @category marketplace
 */


function addMetadataToToken(user, context, callback) {
  const namespace = 'https://cumulio/';
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.cumulio = user.user_metadata.cumulio || {};
  Object.keys(user.user_metadata.cumulio).forEach((k) => {
    context.idToken[namespace + k] = user.user_metadata.cumulio[k];
    context.accessToken[namespace + k] = user.user_metadata.cumulio[k];
  });
  callback(null, user, context);
}
