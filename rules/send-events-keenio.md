---
gallery: true
categories:
- webhook
---
## Send events to Keen.io

This rule is used to send a `signup` event to [Keen IO](http://keen.io)

The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property. If the property is present, everything else is skipped.
If not, then we POST a new event with some information to a `signups Collection` on Keen IO.

Once enabled, events will be displayed on Keen IO dashboard:
![](http://puu.sh/7k4qN.png)

```js
function(user, context, callback) {

  if(user.signedUp){
    return callback(null, user, context);
  }

  var writeKey = 'YOUR KEEN IO WRITE KEY';
  var projectId = 'YOUR KEEN IO PROJECT ID';
  var eventCollection = 'signups';

  var keenEvent = {
    userId: user.user_id,
    name: user.name,
    ip: context.request.ip //Potentially any other properties in the user profile/context
  };

  request.post({
      method: 'POST',
      url: 'https://api.keen.io/3.0/projects/' + projectId + '/events/' + eventCollection + '?api_key=' + writeKey,
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(keenEvent),
      },
      function (e, r, body) {
        if( e ) return callback(e,user,context);
        //We assume everything went well
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
