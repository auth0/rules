---
icon: segmentio.png
short_description: Send events to segment.io
categories:
- webhook
---
## Send events to segment.io

This rule is used to send two differen events to [segment.io](http://segment.io)

The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property. If the property is present then we assume this is a __login__ event, otherwise we assume a new __signup__.

The `sendEvent` function is a simple wrapper around the [segment.io Track REST API](https://segment.io/libraries/rest-api#track) which is trivial to call using the provided `request` module. Notice we are also sending some additional contextual information: the IP address and User Agent of the user.


```js
function(user, context, callback) {

  if(context.protocol === 'delegation') {
    return callback(null, user, context);
  }

  if(context.stats.loginsCount > 1){
    sendEvent('Logged in');
  } else {
    sendEvent('Signed up');
  }

  function sendEvent (e) {
    var sioTrack = {
      userId: user.user_id,
      event: e,
      properties: {
        application: context.clientName
      },
      context: {
        "ip" : context.request.ip,
        "userAgent" : context.request.userAgent
      }
    };

    // Segment API returns 200 OK for all its request. For possible errors
    // you must use Segment's Debugger (https://segment.com/docs/libraries/http/#errors)
    request({
      method: 'POST',
      url: 'https://SEGMENTIO_WRITE_KEY@api.segment.io/v1/track',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(sioTrack),
    });
  }

  callback(null, user, context);
}
```
