/**
 * @overview Tracks Logins in MixPanel
 * @gallery true
 * @category webhook
 *
 * Send a Sign In event to MixPanel to track logins
 *
 * This rule will send a `Sign In` event to MixPanel, and will include the application the user is signing in to as a property.
 * See <a href="https://mixpanel.com/help/reference/http">MixPanel HTTP API</a> for more information.
 *
 */

function (user, context, callback) {

  const mpEvent = {
    "event": "Sign In",
    "properties": {
        "distinct_id": user.user_id,
        "token": configuration.MIXPANEL_API_TOKEN,
        "application": context.clientName
    }
  };

  const base64Event = Buffer.from(JSON.stringify(mpEvent)).toString('base64');

  request.get({
    url: 'http://api.mixpanel.com/track/',
    qs: {
      data: base64Event
    }
  }, (err, res, body) => {
      // don’t wait for the MixPanel API call to finish, return right away (the request will continue on the sandbox)`
      callback(null, user, context);
  });
}
