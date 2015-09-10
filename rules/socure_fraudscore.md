---
gallery: true
categories:
- enrich profile
---
## Detect Fraud Users

This rule gets the fraud score from socure.com and store it on app_metadata.

```js
function (user, context, callback) {
  // score fraudscore once (if it's already set, skip this)
  user.app_metadata = user.app_metadata || {};
  if (user.app_metadata.socure_fraudscore) return callback(null, user, context);

  var SOCURE_KEY = 'YOUR SOCURE API KEY';
  
  if(!user.email) {
    // the profile doesn't have email so we can't query their api.
    return callback(null, user, context);
  }

  // socurekey=A678hF8E323172B78E9&email=jdoe@acmeinc.com&ipaddress=1.2.3.4&mobilephone=%2B12015550157
  request({
    url: 'https://service.socure.com/api/1/EmailAuthScore',
    qs: {
      email:  user.email,
      socurekey: SOCURE_KEY,
      ipaddress: context.request.ip
    }
  }, function (err, resp, body) {
    if (err) return callback(null, user, context);
    if (resp.statusCode !== 200) return callback(null, user, context);
    var socure_response = JSON.parse(body);
    if (socure_response.status !== 'Ok') return callback(null, user, context);
    
    user.app_metadata = user.app_metadata || {};
    user.app_metadata.socure_fraudscore = socure_response.data.fraudscore;
    user.app_metadata.socure_confidence = socure_response.data.confidence;
    // "details":[  
    //     "blacklisted":{  
    //        "industry":"Banking and Finance",
    //        "reporteddate":"2014-07-02",
    //        "reason":"ChargeBack Fraud"
    //     }
    // ] 
    user.app_metadata.socure_details = socure_response.data.details;
    
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        callback(null, user, context);
      })
      .catch(function(err){
        callback(null, user, context);
      });
  });
}
```
