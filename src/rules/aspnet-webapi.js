/**
 * @title Custom webhook with ASPNET WebApi2
 * @overview Post variables sent to your Rule as a custom webhook in an ASP.NET WebApi application.
 * @gallery true
 * @category webhook
 *
 * This rule shows how to post the variables sent to your Rule a custom webhook in an ASP.NET WebApi application. This is useful for situations where you want to enrich the User's profile with your internal ID before the JsonWebToken is created, or if you want to seamlessly register new users.
 *
 * In this example, we're going to get the internal UserId for your app, then persist it to the Auth0 UserProfile so we only have to make this request the first time a new user signs in.
 *
 * Within the snippet, the "secretToken" is a simple way to ensure that the communication is coming from Auth0. Just configure a random string for the Rule, and then check for that string in your WebApi request.
 *
 * In your WebApi code, complete whatever operations are necessary, then call `return Json(new { customId = USERSCUSTOMID });` to return the required JSON to the Rule.
 *
 * > Note: Be sure to change the URL for the request to your website and controller, and make sure the controller is decorated with the `[HttpPost]` attribute.
 *
 * Contributed by Robert McLaws, AdvancedREI.com
 *
 */

function aspnetWebApi(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  if (user.app_metadata.customId) {
    console.log('Found ID!');
    return callback(null, user, context);
  }

  // You should make your requests over SSL to protect your app secrets.
  request.post({
    url: 'https://yourwebsite.com/auth0',
    json: {
      user: user,
      context: context,
      secretToken: configuration.YOURWEBSITE_SECRET_TOKEN,
    },
    timeout: 15000
  }, (err, response, body) => {
    if (err) return callback(new Error(err));

    user.app_metadata.customId = body.customId;
    context.idToken['https://example.com/custom_id'] = body.customId;

    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        callback(null, user, context);
      })
      .catch(function(err){
        callback(err);
      });
  });
}
