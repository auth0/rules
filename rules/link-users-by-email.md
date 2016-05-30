---
gallery: true
categories:
  - access control
---

# Link Accounts with Same Email Address
This rule will link any accounts that have the same email address.

> Note: When linking accounts, only the metadata of the target user is saved. If you want to merge the metadata of the two accounts you must do that manually. See the document on [Linking Accounts](https://auth0.com/docs/link-accounts) for more details.

```js
function (user, context, callback) {
  var request = require('request@2.56.0');
  // Check if email is verified, we shouldn't automatically
  // merge accounts if this is not the case.
  if (!user.email_verified) {
    return callback(null, user, context);
  }

  request({
   url: auth0.baseUrl + '/users',
   headers: {
     Authorization: 'Bearer ' + auth0.accessToken
   },
   qs: {
     search_engine: 'v2',
     q: 'email:"' + user.email + '" -user_id:"' + user.user_id + '"',
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
          request.post({
            url: userApiUrl + '/' + user.user_id + '/identities',
            headers: {
              Authorization: 'Bearer ' + auth0.accessToken
            },
            json: { provider: provider, user_id: targetUserId }
          }, function(err, response, body) {
              if (response.statusCode >= 400) {
               cb(new Error('Error linking account: ' + response.statusMessage));  
              }
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
