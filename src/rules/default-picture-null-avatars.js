/**
 * @title Default picture for null avatars
 * @overview Set a default picture for null avatars.
 * @gallery true
 * @category enrich profile
 *
 * This rule will set a default picture for null avatars via a rule for email-based logins:
 *
 */

function defaultPictureForNullAvatars(user, context, callback) {
  if (user.picture.indexOf("cdn.auth0.com") > -1) {
    const url = require("url");
    const u = url.parse(user.picture, true);
    u.query.d = "URL_TO_YOUR_DEFAULT_PICTURE_HERE";
    delete u.search;
    user.picture = url.format(u);
  }
  callback(null, user, context);
}
