---
gallery: true
short_description: Get user email address from Twitter
categories:
- enrich profile
---
## Get email address from Twitter

NOTE: Further configuration is needed to enable fetching user emails through your Twitter App. Take a look at [Twitter's doc](https://dev.twitter.com/rest/reference/get/account/verify_credentials) for specifics.

The rule which makes the call to Twitter to retrieve the email is as follows. Do not forget to update
`consumerKey` and `oauthTokenSecret` properly.

```javascript
function (user, context, callback) {
    // additional request below is specific to Twitter
    if (context.connectionStrategy !== 'twitter') {
        return callback(null, user, context);
    }

    var oauth = require('oauth-sign');
    var request = require('request');
    var uuid = require('uuid');

    var url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    var consumerKey = 'UPDATE-WITH-YOUR-CONSUMER-KEY';
    var consumerSecretKey = 'UPDATE-WITH-YOUR-CONSUMER-SECRET-KEY';

    var twitterIdentity = _.find(user.identities, { connection: 'twitter' });
    var oauthToken = twitterIdentity.access_token;
    var oauthTokenSecret = twitterIdentity.access_token_secret;

    var timestamp = Date.now() / 1000;
    var nonce = uuid.v4().replace(/-/g, '');

    var params = {
        include_email: true,
        oauth_consumer_key: consumerKey,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_token: oauthToken,
        oauth_version: '1.0'
    };

    params.oauth_signature = oauth.hmacsign('GET', url, params, consumerSecretKey, oauthTokenSecret);

    var auth = Object.keys(params).sort().map(function (k) {
        return k + '="' + oauth.rfc3986(params[k]) + '"';
    }).join(', ');

    request({
        url: url + '?include_email=true',
        headers: {
            'Authorization': 'OAuth ' + auth
        }
    }, function (err, resp, body) {
        if (resp.statusCode !== 200) {
            return callback(new Error('Error retrieving email from twitter: ' + body || err));
        }
        user.email = JSON.parse(body).email;
        return callback(err, user, context);
    });
}
```

This rule will not persist the returned email to the Auth0 user profile, but will return it to your application. If you want to persist the email, it will need to be [done with app_metadata as described here](https://auth0.com/docs/rules/metadata-in-rules#updating-app_metadata). For example, you can save it under app_metadata.social_email. Then, to access it, you can do the following from a rule or the equivalent in your application:

```javascript
user.app_metadata = user.app_metadata || {};
var email = user.email || user.app_metadata.social_email;
```
