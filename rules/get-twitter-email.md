---
gallery: true
short_description: Get user email address from Twitter
categories:
- enrich profile
---
## Get email address from Twitter

NOTE: For this rule to work, your Twitter application must be whitelisted to access email addresses.

This rule will not persist the returned email to the Auth0 user profile, but it will be returned to your application.
If you want to persist the email, it will need to be [done with `app_metadata` as described here](https://auth0.com/docs/rules/metadata-in-rules#updating-app_metadata).
For example, you can save it under `app_metadata.social_email`.

When accessing the email, you can do the following from a rule or the equivalent in your application:

```
user.app_metadata = user.app_metadata || {};
var email = user.email || user.app_metadata.social_email;
```

The rule which makes the call to Twitter to retrieve the email is as follows:

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
