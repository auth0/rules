/**
 *
 * This integration simplifies the process of making full use of integrated Cumul.io dashboards' multi tenant features
 * by using Auth0 as its authentication layer. The integration will allow you to set up and use user
 * information in Auth0 as Cumul.io parameters to filter and structure your Cumul.io dashboards.
 *
 * @title User app_metadata for Cumul.io
 * @overview Add Cumul.io user app_metadata to tokens to be used for Cumul.io dashboard filtering
 * @gallery false
 * @category marketplace
 */

function addMetadataToTokens(user, context, callback) {
  const namespace = 'https://cumulio/';
  user.app_metadata = user.app_metadata || {};
  const cumulioMetadata = user.app_metadata.cumulio || {};
  if (typeof cumulioMetadata === 'object' && cumulioMetadata !== null) {
    Object.keys(cumulioMetadata).forEach((k) => {
      context.idToken[namespace + k] = cumulioMetadata[k];
      context.accessToken[namespace + k] = cumulioMetadata[k];
    });
  } else {
    console.log(
      'Make sure that app_metadata.cumulio is an object with keys and values'
    );
    return;
  }
  callback(null, user, context);
}
