---
gallery: true
categories:
- webhook
---
## Send emails through SendGrid

This rule will send an email to an administrator on the first login of a user.

We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.

In the same way you can use other services like [Amazon SES](http://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html), [Mandrill](mandrill.md) and few others.

```
function(user, context, callback) {
  if (!user.app_metadata.signedUp) {
    return callback(null, user, context);
  }

  request.post( {
    url: 'https://api.sendgrid.com/api/mail.send.json',
    form: {
      'api_user': 'YOUR SENDGRID API USER',
      'api_key': 'YOUR SENDGRID API PASS',
      'to': 'admin@myapp.com',
      'subject': 'NEW SIGNUP',
      'from': 'admin@myapp.com',
      'text': 'We have got a new sign up from: ' + user.email + '.'
    }
  }, function(e,r,b) {
    if (e) return callback(e);
    if (r.statusCode !== 200) return callback(new Error('Invalid operation'));

    user.app_metadata.signedUp = true;
    auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function(){
      callback(null, user, context);
    });
    .catch(function(err){
      callback(err);
    });
  });
}
```
