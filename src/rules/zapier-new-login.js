/**
 * @title Trigger a Zap on Every User Login
 * @overview Trigger a Zap on Every User Login to Zapier
 * @gallery true
 * @category webhook
 *
 * **What is Zapier?** [Zapier](http://zapier.com) is a tool for primarily non-technical users to connect together web apps. An integration between two apps is called a Zap. A Zap is made up of a Trigger and an Action. Whenever the trigger happens in one app, Zapier will automatically perform the action in another app.
 *
 * ![](https://cloudup.com/iGyywQuJqIb+)
 *
 * This rule will call Zapier static hook every time a user logs in.
 *
 */

function triggerZapOnUserLogin(user, context, callback) {
  const _ = require('lodash');
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
    url : configuration.ZAP_HOOK_URL,
    json: payload_to_zap
  },
  function (err, response, body) {
    // swallow error
    callback(null, user, context);
  });
}
