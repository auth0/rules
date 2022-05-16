/**
 *
 * This rule will send an email to an administrator on a user's first login. We use a persistent `signedUp` property to track whether this is the case or not.
 *
 * This rule assumes you've stored a secure value named `MANDRILL_API_KEY`, which contains your secret API key for Mandrill. It will be sent with each request.
 *
 * In the same way, other services such as [Amazon SES](http://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html) and [SendGrid](https://auth0.com/rules/sendgrid) can be used.
 *
 * Make sure to change the sender and destination emails.
 *
 * @title Send email with Mandrill
 * @overview Send email with Mandrill
 * @gallery true
 * @category webhook
 */

function sendMandrillEmail(user, context, callback) {
  const request = require('request');

  user.app_metadata = user.app_metadata || {};
  // Only send an email when user signs up
  if (user.app_metadata.signedUp) {
    return callback(null, user, context);
  }

  // See https://mandrillapp.com/api/docs/messages.JSON.html#method=send
  const body = {
    key: configuration.MANDRILL_API_KEY,
    message: {
      subject: 'User ' + user.name + ' signed up to ' + context.clientName,
      text: 'Sent from an Auth0 rule',
      from_email: 'SENDER_EMAIL@example.com',
      from_name: 'Auth0 Rule',
      to: [
        {
          email: 'DESTINATION_EMAIL@example.com',
          type: 'to'
        }
      ]
    }
  };
  const mandrill_send_endpoint =
    'https://mandrillapp.com/api/1.0/messages/send.json';

  request.post(
    { url: mandrill_send_endpoint, form: body },
    function (err, resp, body) {
      if (err) {
        return callback(err);
      }
      user.app_metadata.signedUp = true;
      auth0.users
        .updateAppMetadata(user.user_id, user.app_metadata)
        .then(function () {
          callback(null, user, context);
        })
        .catch(function (err) {
          callback(err);
        });
    }
  );
}
