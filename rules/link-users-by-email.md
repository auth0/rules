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
/**
 * This Auth0 rule will link 2 accounts with the same email address. It will use the oldest account as the primary
 * so that a oAuth user_id in Auth0 does not change from out beneath you
 *
 * @param user
 * @param context
 * @param callback
 * @returns {*}
 */
function(user, context, callback) {
  console.log('entering link accts rule with user', user);
  console.log('context', context);

  if (!user.email_verified) { //dont merge un-verified
    console.error('* email NOT verified, returning');
    return callback(null, user, context);
  }

  var currUserTmp     = user.user_id.split('|'),
      currUserProvier = currUserTmp[0],
      currUserId      = currUserTmp[1];

  var userApiUrl   = auth0.baseUrl + '/users',
      bearerHeader = 'Bearer ' + auth0.accessToken;

  request({
      url:     userApiUrl,
      headers: {
        Authorization: bearerHeader
      },
      qs:      {
        search_engine: 'v2',
        q:             'email:"' + user.email + '"',
      }
    },
    function(err, response, body) {
      if (err) {
        return callback(err);
      }

      console.log('search result', body);
      if (response.statusCode !== 200) {
        return callback(new Error(body));
      }

      try {
        var data = JSON.parse(body);
        if (data.length <= 0) {
          console.log('* No other users with same email address. returning');
          return callback(null, user, context);
        }

        //There is a timing issue/bug where user that initated this rule, is not yet returning from the search results
        var currUserInSearchResult = data.some(function(u) {
          return u.identities.some(function(ident) {
            return (ident.provider === currUserProvier && ident.user_id === currUserId);
          });
        });
        if (!currUserInSearchResult) {
          console.log('* current user NOT in search result. Manually adding', user.user_id);
          data.push({
            email_verified: true,
            user_id:        user.user_id,
            created_at:     user.created_at
          });
        }

        data.sort(function(a, b) {
          if (b.created_at > a.created_at) {
            return -1;
          } else if (b.created_at < a.created_at) {
            return 1;
          } else {
            return 0;
          }
        });

        var primaryUser = data.shift();
        console.log('primary user', primaryUser);

        if (data.length <= 0) {
          console.log('* No other users with same email address.');
          return callback(null, user, context);
        }

        async.each(data, function(targetUser, cb) {
          if (!targetUser.email_verified) {
            console.log('* targetUser', targetUser, 'does not have verified email. Skipping');
            return cb();
          }

          var aryTmp       = targetUser.user_id.split('|'),
              provider     = aryTmp[0],
              targetUserId = aryTmp[1];

          console.log('* linking', targetUser.user_id);
          request.post({
            url:     userApiUrl + '/' + primaryUser.user_id + '/identities',
            headers: {
              Authorization: bearerHeader
            },
            json:    {provider: provider, user_id: targetUserId}
          }, function(err, response, body) {
            if (response.statusCode >= 400) {
              cb(new Error('Error linking account: ' + response.statusMessage));
            }
            cb(err);
          });

        }, function(err) {
          if (err) {
            console.error('async err', err);
          }
          callback(err, user, context);
        });
      } catch (e) {
        console.error('catch err', e);
        callback(e);
      }
    });
}
```
