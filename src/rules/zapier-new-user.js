/**
 * @title Trigger a Zap on New Users
 * @overview Trigger a Zap on every new user signup to Zapier.
 * @gallery true
 * @category webhook
 *
 * **What is Zapier?** [Zapier](http://zapier.com) is a tool for primarily non-technical users to connect together web apps. An integration between two apps is called a Zap. A Zap is made up of a Trigger and an Action. Whenever the trigger happens in one app, Zapier will automatically perform the action in another app.
 *
 * ![](https://cloudup.com/cgwZds8MjA7+)
 *
 * This rule will call Zapier static hook every time a user's first successful login.
 *
 */

function (user, context, callback) {
  // short-circuit if the request already happened 
  user.app_metadata = user.app_metadata || {};
  
  if (user.app_metadata.zapTriggered) {
    return callback(null, user, context);
  }

  const MY_SLACK_WEBHOOK_URL = 'YOUR SLACK WEBHOOK URL';
  const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

  const request = require('request');

  const small_context = {
    appName: context.clientName,
    userAgent: context.request.userAgent,
    ip: context.request.ip,
    connection: context.connection,
    strategy: context.connectionStrategy
  };

  const payload_to_zap = Object.assign({}, user, small_context);

  request.post({
    url: configuration.ZAP_HOOK_URL,
    json: payload_to_zap
  }, (err) => {

    if (err) {
      slack.alert({
        channel: '#some_channel',
        text: 'Error sending zap on first login',
        fields: {
          error: response
        }
      });

      return;
    }

    // record a succesful zap so that we only do it once
    user.app_metadata.zapTriggered = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
  });

  // don’t wait for the Zapier WebHook call to finish, return right away (the request will continue on the sandbox)
  callback(null, user, context);

}
