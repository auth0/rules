---
gallery: true
categories:
- webhook
---
## Slack Notification on User Signup

This rule sends a message to a slack channel on every user signup.

```js
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // short-circuit if the user signed up already
  if (user.app_metadata.signed_up) return callback(null, user, context);

  // get the token from: https://auth0.slack.com/services/new/bot
  // Then invite the bot to the channels you want
  var token = configuration.SLACK_TOKEN;
  var channel = '#SOME_CHANNEL';
  var text = 'New User: ' + (user.name || user.email) + ' (' +  user.email + ')';
  var url = 'https://slack.com/api/chat.postMessage?' + 
          'token=' + encodeURIComponent(token) + 
          '&channel=' + encodeURIComponent(channel) +
          '&text=' + encodeURIComponent(text);
  request({ url: url, method: 'POST' }, function (error, res, body) {
    user.app_metadata.signed_up = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(function(){
      return callback(null, user, context);
    })
    .catch(function(err){
      // swallow
      return callback(null, user, context);
    });
  });

}
```
