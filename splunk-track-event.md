## Tracks Logins/SignUps with Splunk

This rule will send a `SignUp` & `Login` events to Splunk, including some contextual information of the user: the application the user is signing in, client IP address, username, etc.

We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.

Events will show up on the Splunk console shortly after user access:

![](http://puu.sh/7R1EW.png)

```
function(user, context, callback) {
  
  var splunkBaseUrl = 'YOUR SPLUNK SERVER, like: https://your server:8089';
  
  //Add any interesting info to the event
  var event = {
    message: user.signedUp ? 'Login' : 'SignUp',
    application: context.clientName,
    clientIP: context.request.ip,
    protocol: context.protocol,  
    userName: user.name,
    userId: user.user_id
  };
  
  request.post( {
                  url: splunkBaseUrl + '/services/receivers/simple?source=auth0&sourcetype=auth0_activity',
                  auth: {
                      'user': 'YOUR SPLUNK USER',
                      'pass': 'YOUR SPLUNK PASSWORD',
                    },
                  body: JSON.stringify(event)
                },
                function(e,r,b) {
                    if( e ) return callback(e);
                    if( r.statusCode !== 200 ) return callback('Invalid operation');
                    user.persistent.signedUp = true;
                    return callback(e,user,context);
                 });
}
```
