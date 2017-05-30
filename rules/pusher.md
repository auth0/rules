---
gallery: true
short_description: Obtain a Pusher token for subscribing/publishing to private channels
categories:
- webhook
---
## Obtains a Pusher token for subscribing/publishing to private channels

This rule will generate a [pusher.com] token that can be used to send and receive messages from private channels. See [a complete example here](https://github.com/auth0/auth0-pusher).


```js
function (user, context, callback) {

  var pusherKey='YOUR PUSHER KEY';
  var pusherSecret = '{YOUR PUSHER SECRET}';
 
  if( context.request.query.channel && context.request.query.socket_id)
  {
    user['https://example.com/pusherAuth'] = pusherKey + ":" + sign(pusherSecret, context.request.query.channel, context.request.query.socket_id);
  }

  callback(null, user, context);

  function sign(secret, channel, socket_id)
  {
    var string_to_sign = socket_id+":"+channel;
    var sha = crypto.createHmac('sha256',secret);
    return sha.update(string_to_sign).digest('hex');
  }
}
```
