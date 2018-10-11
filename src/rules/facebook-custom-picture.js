/**
 * @title Use a custom sized profile picture for Facebook connections
 * @overview Set a custom sized profile picture for Facebook connections
 * @gallery true
 * @category enrich profile
 *
 * This rule will set the `picture` to a custom size for users who login with Facebook.
 *
 */

function (user, context, callback) {
  if (context.connection === 'facebook') {
    const fbIdentity = _.find(user.identities, { connection: 'facebook' });
    // for more sizes and types of images that can be returned, see:
    // https://developers.facebook.com/docs/graph-api/reference/user/picture/
    const pictureType = 'large';
    context.idToken.picture = 'https://graph.facebook.com/v2.5/' + fbIdentity.user_id + '/picture?type=' + pictureType;
  }
  callback(null, user, context);
}
