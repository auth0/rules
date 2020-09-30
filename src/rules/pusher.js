/**
 * @title Obtain a Pusher token for subscribing and publishing to private channels
 * @overview Obtains a Pusher token for subscribing/publishing to private channels.
 * @gallery true
 * @category webhook
 *
 * This rule will generate a [pusher.com] token that can be used to send and receive messages from private channels. See [a complete example here](https://github.com/auth0/auth0-pusher).
 *
 */

function getPusherToken(user, context, callback) {
  const crypto = require('crypto');

  const pusherKey = configuration.PUSHER_KEY;
  const pusherSecret = configuration.PUSHER_SECRET;

  if (context.request.query.channel && context.request.query.socket_id) {
    const pusherSigned = sign(pusherSecret, context.request.query.channel, context.request.query.socket_id);
    context.idToken['https://example.com/pusherAuth'] = pusherKey + ':' + pusherSigned;
  }

  callback(null, user, context);

  function sign(secret, channel, socket_id) {
    const string_to_sign = socket_id + ':' + channel;
    const sha = crypto.createHmac('sha256', secret);
    return sha.update(string_to_sign).digest('hex');
  }
}
