## Send events to segment.io

This rule is used to send two differen events to [segment.io](http://segment.io) 

The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property. If the property is present then we assume this is a __login__ event, otherwise we assume a new __signup__.

The `sendEvent` function is a simple wrapper around the [segment.io Track REST API](https://segment.io/libraries/rest-api#track) which is trivial to call using the provided `request` module. Notice we are also sending some additional contextual information: the IP address and User Agent of the user.


```js
function(user, context, callback) {

  if(user.signedUp){
    sendEvent('login');
  } else {
    sendEvent('signup');  
  }

  function sendEvent(e)
  {
    var sioTrack =  
    {
      secret: "YOUR SEGMENTIO SECRET",
      userId: user.user_id,
      event: e,
      properties: {
        application: context.clientName,
        ip: context.ip,
        agent: context.userAgent
      },
      context: {
        "providers" : { "all": false }
      }
    };

    request({
      method: 'POST',
      url: '  https://api.segment.io/v1/track',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(sioTrack),
    }, 
    function (err, response, body) {
      if(err) return callback(err, user, context);
      if(e === 'signup'){ user.persistent.signedUp = true; }
      callback(null, user, context);
    });
  }
}
```
