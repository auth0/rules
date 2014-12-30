---
gallery: true
categories:
- webhook
---
# Send email with Mandrill

This rule will send an email to an administrator on a user's first login. We use a persistent `signedUp` property to track whether this is the case or not.

In the same way, other services such as [Amazon SES](http://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html) and [SendGrid](sendgrid.md) can be used.

Make sure to change the sender and destination emails.

```js
function (user, context, callback) {
  // Only send an email when user signs up
  if (user.persistent.signedUp) {
    // See https://mandrillapp.com/api/docs/messages.JSON.html#method=send
    var body = {
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
        ],
      }
    };
    var mandrill_send_endpoint = 'https://mandrillapp.com/api/1.0/messages/send.json';

    request.post({url: mandrill_send_endpoint, form: body}, function (err, resp, body) {
      if (!err) {
        user.persistent.signedUp = true;
        callback(null, user, context);
      } else {
        throw new Error(body);
      }
    });
  } else {
    // User had already logged in before, do nothing
    callback(null, user, context);
  }
}
```
