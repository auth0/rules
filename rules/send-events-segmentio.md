---
icon: segmentio.png
categories:
- webhook
---
## Send events to segment.io

This rule is used to send two differen events to [segment.io](http://segment.io)

The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property. If the property is present then we assume this is a __login__ event, otherwise we assume a new __signup__.

The `sendEvent` function is a simple wrapper around the [segment.io Track REST API](https://segment.io/libraries/rest-api#track) which is trivial to call using the provided `request` module. Notice we are also sending some additional contextual information: the IP address and User Agent of the user.


```js
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  
  if(user.app_metadata.signedUp){
    sendEvent('Logged in');
  } else {
    sendEvent('Signed up');
  }

  function sendEvent(e)
  {
    var sioTrack =  
    {
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
    request({
      method: 'POST',
      url: 'https://SEGMENTIO_WRITE_KEY@api.segment.io/v1/track',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(sioTrack),
    }, 
    function (err, response, body) {
      if(err) return callback(err, user, context);
      if(e === 'Signed up') {
        user.app_metadata.signedUp = true;
        auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
          .then(function(){
            callback(null, user, context);
          })
          .catch(function(err){
            callback(err);
          });
      } else {
        callback(null, user, context);
      }
    });
  }
}
```
