---
gallery: true
short_description: Send an email to an administrator through SendGrind on the first login of a user
categories:
- webhook
---
## Send emails through SendGrid

This rule will send an email to an administrator on the first login of a user.

We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.

In the same way you can use other services like [Amazon SES](http://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html), [Mandrill](mandrill.md) and few others.

```js
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  if (!user.app_metadata.signedUp) {
    return callback(null, user, context);
  }

  request.post( {
    url: 'https://api.sendgrid.com/api/mail.send.json',
    headers: {
      'Authorization': 'Bearer ...'
    },
    form: {
      'to': 'admin@example.com',
      'subject': 'NEW SIGNUP',
      'from': 'admin@example.com',
      'text': 'We have got a new sign up from: ' + user.email + '.'
    }
  }, function(e,r,b) {
    if (e) return callback(e);
    if (r.statusCode !== 200) return callback(new Error('Invalid operation'));

    user.app_metadata.signedUp = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(function(){
      callback(null, user, context);
    })
    .catch(function(err){
      callback(err);
    });
  });
}
```
