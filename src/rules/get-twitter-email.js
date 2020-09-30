/**
 * @title Get email address from Twitter
 * @overview Get user email address from Twitter.
 * @gallery true
 * @category enrich profile
 *
 * Get email address from Twitter
 *
 * > Note: Further configuration is needed to enable fetching user emails through your Twitter App.
 * Take a look at [Twitter's doc](https://dev.twitter.com/rest/reference/get/account/verify_credentials) for specifics.
 *
 * The rule which makes the call to Twitter to retrieve the email is as follows. Do not forget to configure
 * `consumerKey` and `consumerSecretKey` properly.
 *
 * This rule will not persist the returned email to the Auth0 user profile, but will return it to your application.
 *
 * If you want to persist the email, it will need to be done with app_metadata as described here: https://auth0.com/docs/rules/metadata-in-rules#updating-app_metadata.
 *
 * For example, you can save it under `app_metadata.social_email`.
 *
 */

function getTwitterEmail(user, context, callback) {
  // additional request below is specific to Twitter
  if (context.connectionStrategy !== 'twitter') {
    return callback(null, user, context);
  }

  const _ = require('lodash');
  const request = require('request');
  const oauth = require('oauth-sign');
  const uuid = require('uuid');

  const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  const consumerKey = configuration.TWITTER_CONSUMER_KEY;
  const consumerSecretKey = configuration.TWITTER_CONSUMER_SECRET_KEY;

  const twitterIdentity = _.find(user.identities, { connection: 'twitter' });
  const oauthToken = twitterIdentity.access_token;
  const oauthTokenSecret = twitterIdentity.access_token_secret;

  const timestamp = Date.now() / 1000;
  const nonce = uuid.v4().replace(/-/g, '');

  const params = {
    include_email: true,
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: oauthToken,
    oauth_version: '1.0'
  };

  params.oauth_signature = oauth.hmacsign('GET', url, params, consumerSecretKey, oauthTokenSecret);

  const auth = Object.keys(params)
    .sort()
    .map(function (k) {
      return k + '="' + oauth.rfc3986(params[k]) + '"';
    })
    .join(', ');

  request.get(
    url + '?include_email=true',
    {
      headers: {
        Authorization: 'OAuth ' + auth
      },
      json: true
    },
    (err, resp, body) => {
      if (resp.statusCode !== 200) {
        return callback(new Error('Error retrieving email from twitter: ' + body || err));
      }
      user.email = body.email;
      return callback(err, user, context);
    }
  );
}
