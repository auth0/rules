---
gallery: true
categories:
- webhook
---
## Send events to Keen

This rule is used to send a `signup` event to [Keen IO](http://keen.io)

The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property. If the property is present, everything else is skipped.
If not, then we POST a new event with some information to a `signups Collection` on Keen IO.

Once enabled, events will be displayed on Keen IO dashboard:
![](http://puu.sh/7k4qN.png)

```js
function(user, context, callback) {
  if (context.stats.loginsCount > 1) {
    return callback(null, user, context);
  }

  var MY_SLACK_WEBHOOK_URL = 'YOUR SLACK WEBHOOK URL';
  var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

  var writeKey = 'YOUR KEEN IO WRITE KEY';
  var projectId = 'YOUR KEEN IO PROJECT ID';
  var eventCollection = 'signups';

  var keenEvent = {
    userId: user.user_id,
    name: user.name,
    ip: context.request.ip //Potentially any other properties in the user profile/context
  };

  request.post({
    method: 'POST',
    url: 'https://api.keen.io/3.0/projects/' + projectId + '/events/' + eventCollection + '?api_key=' + writeKey,
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(keenEvent),
  },
  function (error, response, body) {
    
    if( error || (response && response.statusCode !== 200) ) {
      slack.alert({
        channel: '#some_channel',
        text: 'KEEN API ERROR',
        fields: {
          error: error ? error.toString() : (response ? response.statusCode + ' ' + body : '')
        }
      });
    }
  });

  callback(null, user, context);
}
```
