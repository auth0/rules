/**
 * @title User metadata for Cumul.io
 * @overview Add Cumul.io user metadata to tokens to be used for Cumul.io dashboard filtering
 * @gallery true
 * @category marketplace
 *
 * This integration simplifies the process of making full use of integrated Cumul.io dashboards' multi tenant features 
 * by using Auth0 as its authentication layer. The integration will allow you to set up and use user 
 * information in Auth0 to filter and structure your Cumul.io dashboards.
 */


function addMetadataToTokens(user, context, callback) {
  const namespace = 'https://cumulio/';
  user.user_metadata = user.user_metadata || {};
  const cumulioMetadata = user.user_metadata.cumulio || {};
  if(typeof cumulioMetadata === 'object' && cumulioMetadata !== null){ 
    Object.keys(cumulioMetadata).forEach((k) => {
      context.idToken[namespace + k] = cumulioMetadata[k];
      context.accessToken[namespace + k] = cumulioMetadata[k];
    });
  }
  else{
  	console.log("Make sure that user_metadata.cumulio is an object with keys and values");
    return;
  }
  callback(null, user, context);
}
