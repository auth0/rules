---
gallery: true
categories:
- webhook
---
## Trigger a Zap on New Users

**What is Zapier?** [Zapier](http://zapier.com) is a tool for primarily non-technical users to connect together web apps. An integration between two apps is called a Zap. A Zap is made up of a Trigger and an Action. Whenever the trigger happens in one app, Zapier will automatically perform the action in another app.

![](https://cloudup.com/cgwZds8MjA7+)

This rule will call Zapier static hook every time a new user signs up.

```js
function (user, context, callback) {
  var ZAP_HOOK_URL = 'REPLACE_ME';

  // short-circuit if the user signed up already
  if (user.app_metadata.signed_up) return callback(null, user, context);

  var small_context = {
    appName: context.clientName,
    userAgent: context.userAgent,
    ip: context.ip,
    connection: context.connection,
    strategy: context.connectionStrategy
  };
  var payload_to_zap = extend({}, user, small_context);
  request.post({
    url: ZAP_HOOK_URL,
    json: payload_to_zap
  },
  function (err, response, body) {
    // swallow error
    // mark the user as `signed_up` so next time the rule does not execute
    user.app_metadata.signed_up = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        callback(null, user, context);
      })
      .catch(function(err){
        callback(err);
      });
    callback(null, user, context);
  });

  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i],
          keys = Object.keys(source);

      for (var j = 0; j < keys.length; j++) {
          var name = keys[j];
          target[name] = source[name];
      }
    }
    return target;
  }
}
```
