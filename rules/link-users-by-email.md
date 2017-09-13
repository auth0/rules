---
gallery: true
short_description: Link any accounts that have the same email address
categories:
  - access control
---

# Link Accounts with Same Email Address
This rule will link any accounts that have the same email address.

> Note: When linking accounts, only the metadata of the target user is saved. If you want to merge the metadata of the two accounts you must do that manually. See the document on [Linking Accounts](https://auth0.com/docs/link-accounts) for more details.

```js
function(user, context, callback) {
  var request = require('request@2.56.0');
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
      var aryTmp = user.user_id.split('|');
      var provider = aryTmp[0];
      var newUserId = aryTmp[1];
      request.post({
        url: userApiUrl + '/' + originalUser.user_id + '/identities',
        headers: {
          Authorization: 'Bearer ' + auth0.accessToken
        },
        json: {
          provider: provider,
          user_id: newUserId
        }
      }, function(err, response, body) {
        if (response.statusCode >= 400) {
          return callback(new Error('Error linking account: ' + response.statusMessage));
        }
        context.primaryUser = originalUser.user_id;
        callback(null, user, context);
      });
    });
}
```
