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
     q: 'email.raw:"' + user.email + '" -user_id:"' + user.user_id + '"',
   }
  },
  function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode !== 200) return callback(new Error(body));

    var data = JSON.parse(body);
    if (data.length > 0) {
      async.each(data, function(targetUser, cb) {
        if (targetUser.email_verified) {
          var aryTmp = targetUser.user_id.split('|');
          var provider = aryTmp[0];
          var targetUserId = aryTmp[1];

          targetUser.app_metadata = targetUser.app_metadata || {};
          targetUser.user_metadata = targetUser.user_metadata || {};
          auth0.users.updateAppMetadata(user.user_id, targetUser.app_metadata)
          .then(auth0.users.updateUserMetadata(user.user_id, targetUser.user_metadata))
          .then(function(){
            request.post({
              url: userApiUrl + '/' + user.user_id + '/identities',
              headers: {
                Authorization: 'Bearer ' + auth0.accessToken
              },
              json: { provider: provider, user_id: targetUserId }
            }, function(err, response, body) {
                if (response && response.statusCode >= 400) {
                  return cb(new Error('Error linking account: ' + response.statusMessage));
                }
                cb(err);
            });
          })
          .catch(function(err){
            cb(err);
          });
        } else {
          cb();
        }
      }, function(err) {
        callback(err, user, context);
      });
    } else {
      callback(null, user, context);
    }
  });
}
```
