/**
 * @overview Link any accounts that have the same email address
 * @gallery true
 * @category access control
 *
 * Link Accounts with Same Email Address
 * This rule will link any accounts that have the same email address.
 *
 * > Note: When linking accounts, only the metadata of the target user is saved. If you want to merge the metadata of the two accounts you must do that manually. See the document on [Linking Accounts](https://auth0.com/docs/link-accounts) for more details.
 */

function (user, context, callback) {
  const request = require('request');
  // Check if email is verified, we shouldn't automatically
  // merge accounts if this is not the case.
  if (!user.email || !user.email_verified) {
    return callback(null, user, context);
  }
  const userApiUrl = auth0.baseUrl + '/users';
  const userSearchApiUrl = auth0.baseUrl + '/users-by-email';

  request({
    url: userSearchApiUrl,
    headers: {
      Authorization: 'Bearer ' + auth0.accessToken
    },
    qs: {
      email: user.email
    }
  },
  function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode !== 200) return callback(new Error(body));

    let data = JSON.parse(body);
    // Ignore non-verified users and current user, if present
    data = data.filter(function(u) {
      return u.email_verified && (u.user_id !== user.user_id);
    });

    if (data.length > 1) {
      return callback(new Error('[!] Rule: Multiple user profiles already exist - cannot select base profile to link with'));
    }
    if (data.length === 0) {
      console.log('[-] Skipping link rule');
      return callback(null, user, context);
    }

    const originalUser = data[0];
    const provider = user.identities[0].provider;
    const providerUserId = user.identities[0].user_id;
    
    request.post({
      url: userApiUrl + '/' + originalUser.user_id + '/identities',
      headers: {
        Authorization: 'Bearer ' + auth0.accessToken
      },
      json: {
        provider: provider,
        user_id: String(providerUserId)
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
