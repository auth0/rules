---
gallery: true
short_description: Slack notification on user signup
categories:
- webhook
---
## Slack Notification on User Signup

This rule sends a message to a slack channel on every user signup.

```js
function(user, context, callback) {
  // short-circuit if the user signed up already or is using a refresh token
  if (context.stats.loginsCount > 1 || context.protocol === 'oauth2-refresh-token') {
    return callback(null, user, context);
  }

  // get your slack's hook url from: https://slack.com/services/10525858050
  var SLACK_HOOK = 'YOUR SLACK HOOK URL';

  var slack = require('slack-notify')(SLACK_HOOK);
  var message = 'New User: ' + (user.name || user.email) + ' (' + user.email + ')';
  var channel = '#some_channel';

  slack.success({
   text: message,
   channel: channel
  });
  
  // don’t wait for the Slack API call to finish, return right away (the request will continue on the sandbox)`
  callback(null, user, context);
}
```
