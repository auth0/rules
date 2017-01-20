---
gallery: true
short_description: Send SignUp and Login events to Splunk's [HTTP Event Collector] (http://dev.splunk.com/view/event-collector/SP-CAAAE7F), including some contextual information of the user
categories:
- webhook
---
## Tracks Logins/SignUps with Splunk

This rule will send a `SignUp` & `Login` events to Splunk's HTTP Event Collector, including some contextual information of the user: the application the user is signing in, client IP address, username, etc.

We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.

Events will show up on the Splunk console shortly after user access:

## Setup

In order to use this rule, you need to enable HTTP Event Collector (HEC) on your Splunk instance and get an HEC token. You can learn more how to do this [here](http://dev.splunk.com/view/event-collector/SP-CAAAE7F) 

Below is a screenshot showing an SingUp event sent to Splunk Cloud.

![](https://cdn.auth0.com/website/rules/splunk-hec-rule.png)

```js
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  var host = 'YOUR SPLUNK HEC ENDPOINT, like https://localhost:8088';
  var token = 'YOUR SPLUNK HEC TOKEN';

  //Add any interesting info to the event
  var hec_event = {
    event: {
      message: user.app_metadata.signedUp ? 'Login' : 'SignUp',
      application: context.clientName,
      clientIP: context.request.ip,
      protocol: context.protocol,
      userName: user.name,
      userId: user.user_id
    },
    source: "auth0",
    sourcetype: "auth0_activity"
  };

  request.post( {
    url: host + '/services/collector',
    headers: {
        'Authorization': 'Splunk ' + token
      },
    strictSSL: true // set to false if using a self-signed cert
    json: hec_event
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
