---
gallery: true
categories:
- enrich profile
---
## Get email address from Twitter

NOTE: For this rule to work, your Twitter application must be whitelisted to access email addresses.


```js
function(user, context, callback) {
  // NOTE: For this rule to work, your Twitter application must be whitelisted to access email addresses.
  // See: https://dev.twitter.com/rest/reference/get/account/verify_credentials
  //
  // If Twitter does not return an email address, this rule will cause authentication to fail.
  // This might not be the desired behavior, so make sure to adapt it to your requirements.
  //
  // Remember to set the TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET configuration variables.

  var request = require('request');
  var oauth = require('oauth-sign');

  if (context.connectionStrategy !== 'twitter') {
    return callback(null, user, context);
  }

  var url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  var params = {
    include_email: true,
    oauth_consumer_key: configuration.TWITTER_CONSUMER_KEY,
    oauth_nonce: require('uuid').v4().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Date.now() / 1000 | 0,
    oauth_token: user.identities[0].access_token,
    oauth_version: '1.0',
  };

  params.oauth_signature = oauth.hmacsign(
      'GET',
      url,
      params,
      configuration.TWITTER_CONSUMER_SECRET,
      user.identities[0].access_token_secret
  );

  var auth = Object.keys(params).sort().map(function(k) {
    return k + '="' + oauth.rfc3986(params[k]) + '"';
  }).join(', ');

  request({
    url: url + '?include_email=true',
    headers: {
      'Authorization': 'OAuth ' + auth
    }
  }, function(err, resp, body) {
    if (err || resp.statusCode !== 200) {
      return callback(new Error('Error retrieving email from twitter: ' + body || err));
    }
    var result;
    try {
      result = JSON.parse(body);
    } catch (e) {
      return callback(new Error('Invalid JSON returned by Twitter'));
    }
    if (!result.email) {
      // Might not want to fail in this case
      return callback(new Error('Twitter did not return an email address'));
    } else {
      user.email = result.email;
      return callback(null, user, context);
    }
  });
}
```
