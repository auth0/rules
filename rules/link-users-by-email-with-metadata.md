---
gallery: true
short_description: Link any accounts that have the same email address while merging metadata.
categories:
  - access control
---

# Link Accounts with Same Email Address while Merging Metadata
This rule will link any accounts that have the same email address while merging metadata.

```js
function (user, context, callback) {
  var request = require('request@2.56.0');
  var async = require('async@2.1.2');

  // Check if email is verified, we shouldn't automatically
  // merge accounts if this is not the case.
  if (!user.email_verified) {
    return callback(null, user, context);
  }
  var userApiUrl = auth0.baseUrl + '/users';

  request({
   url: userApiUrl,
   headers: {
     Authorization: 'Bearer ' + auth0.accessToken
   },
   qs: {
     search_engine: 'v2',
     q: 'email.raw:"' + user.email + '" AND email_verified: "true" -user_id:"' + user.user_id + '"',
   }
  },
  function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode !== 200) return callback(new Error(body));

    var data = JSON.parse(body);
    if (data.length > 1) {
      return callback(new Error('[!] Rule: Multiple user profiles already exist - cannot select base profile to link with'));
    }
    if (data.length === 0) {
      console.log('[-] Skipping link rule');
      return callback(null, user, context);
    }
    
    var originalUser = data[0];
    var user_id = user.user_id;
    var pipePos = user_id.indexOf('|');
    var provider = user_id.slice(0, pipePos);
    var newUserId = user_id.slice(pipePos + 1);

    user.app_metadata = user.app_metadata || {};
    user.user_metadata = user.user_metadata || {};
    auth0.users.updateAppMetadata(originalUser.user_id, user.app_metadata)
    .then(auth0.users.updateUserMetadata(originalUser.user_id, user.user_metadata))
    .then(function(){
      request.post({
        url: userApiUrl + '/' + originalUser.user_id + '/identities',
        headers: {
          Authorization: 'Bearer ' + auth0.accessToken
        },
        json: { provider: provider, user_id: newUserId }
      }, function(err, response, body) {
          if (response && response.statusCode >= 400) {
            return cb(new Error('Error linking account: ' + response.statusMessage));
          }
          context.primaryUser = originalUser.user_id;
          callback(null, user, context);
      });
    })
    .catch(function(err){
      cb(err);
    });
  });
}
```
