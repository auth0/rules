---
gallery: true
categories:
- webhook
---
## Send emails through Mailgun

This rule will send an email to an administrator on the first login of a user using [Mailgun](https://mailgun.com).

We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.

```js
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  if (user.app_metadata.signedUp) {
    return callback(null, user, context);
  }

  request.post( {
    url: 'https://api.mailgun.net/v3/{YOUR MAILGUN ACCOUNT}/messages',
	  auth:
	  {
  		user: 'api',
	  	pass: '{YOUR MAILGUN KEY}'
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
