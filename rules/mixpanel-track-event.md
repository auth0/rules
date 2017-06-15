---
gallery: true
short_description: Send a Sign In event to MixPanel to track logins
categories:
- webhook
---
## Tracks Logins in MixPanel

This rule will send a `Sign In` event to MixPanel, and will include the application the user is signing in to as a property. See [MixPanel HTTP API](https://mixpanel.com/help/reference/http) for more information.


```js
function (user, context, callback) {

  var mpEvent = {
    "event": "Sign In",
    "properties": {
        "distinct_id": user.user_id,
        "token": "{REPLACE_WITH_YOUR_MIXPANEL_TOKEN}",
        "application": context.clientName
    }
  };

  var base64Event = new Buffer(JSON.stringify(mpEvent)).toString('base64');

  request.get({
    url: 'http://api.mixpanel.com/track/',
    qs: {
      data: base64Event
    }
  }, function (e, r, b){
      // don’t wait for the MixPanel API call to finish, return right away (the request will continue on the sandbox)`
      callback(null, user, context);
  });
}
```
