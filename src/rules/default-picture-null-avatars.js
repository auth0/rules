/**
 * @overview Default picture for null avatars.
 * @gallery true
 * @category enrich profile
 * 
 * Set a default picture for null avatars
 * 
 */

function (user, context, callback) {
  if (user.picture.indexOf('cdn.auth0.com') > -1) {
    const url = require('url');
    const u = url.parse(user.picture, true);
    u.query.d = 'QUERY_PARAM_PATH_TO_YOUR_DEFAULT_PICTURE_HERE.png';
    delete u.search;
    user.picture = url.format(u);
  }
  callback(null, user, context);
}