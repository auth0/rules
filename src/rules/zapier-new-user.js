/**
 * @overview Trigger a Zap on every new user signup to Zapier
 * @gallery true
 * @category webhook
 *
 * Trigger a Zap on New Users
 *
 * **What is Zapier?** [Zapier](http://zapier.com) is a tool for primarily non-technical users to connect together web apps. An integration between two apps is called a Zap. A Zap is made up of a Trigger and an Action. Whenever the trigger happens in one app, Zapier will automatically perform the action in another app.
 *
 * ![](https://cloudup.com/cgwZds8MjA7+)
 *
 * This rule will call Zapier static hook every time a new user signs up.
 */

function (user, context, callback) {
  // short-circuit if the user signed up already
  if (context.stats.loginsCount > 1) {
    return callback(null, user, context);
  }

  const request = require('request');

  const small_context = {
    appName: context.clientName,
    userAgent: context.request.userAgent,
    ip: context.request.ip,
    connection: context.connection,
    strategy: context.connectionStrategy
  };

  const payload_to_zap = _.extend({}, user, small_context);

  request.post({
    url: configuration.ZAP_HOOK_URL,
    json: payload_to_zap
  });

  // don’t wait for the Zapier WebHook call to finish, return right away (the request will continue on the sandbox)`
  callback(null, user, context);
}
