/**
 * @title Send emails through SendGrid
 * @overview Send an email to an administrator through SendGrind on the first login of a user.
 * @gallery true
 * @category webhook
 *
 * This rule will send an email to an administrator on the first login of a user.
 *
 * We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.
 *
 * In the same way you can use other services like [Amazon SES](http://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html), [Mandrill](https://auth0.com/mandrill) and few others.
 */

function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};

  if (user.app_metadata.signedUp) {
    return callback(null, user, context);
  }

  const request = require('request');

  request.post({
    url: 'https://api.sendgrid.com/api/mail.send.json',
    headers: {
      'Authorization': 'Bearer ' + configuration.SENDGRID_API_KEY
    },
    form: {
      'to': 'admin@example.com',
      'subject': 'NEW SIGNUP',
      'from': 'admin@example.com',
      'text': 'We have got a new sign up from: ' + user.email + '.'
    }
  }, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) return callback(new Error('Invalid operation'));

    user.app_metadata.signedUp = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function () {
        callback(null, user, context);
      })
      .catch(function (err) {
        callback(err);
      });
  });
}
