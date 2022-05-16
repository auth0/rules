/**
 *
 * This rule shows how to post the variables sent to your Rule to [RequestBin](https://requestbin.fullcontact.com) to help troubleshoot issues with your Rules.
 *
 * > Note: Auth0 provides [native mechanisms for debugging rules](https://auth0.com/docs/rules/current#how-to-debug-rules). Should you still desire to send internal rule variables to a third-party service, you should deactivate this rule or comment out the code once you are finished troubleshooting.
 *
 * This rule shows how to post the variables sent to your Rule to https://requestbin.fullcontact.com to help troubleshoot issues with your Rules.
 *
 * You can run this rule by itself, or paste it into an existing rule.
 *
 * @title Dump rule variables to RequestBin
 * @overview Shows how to post the variables sent to your Rule to RequestBin to help troubleshoot rule issues
 * @gallery true
 * @category debugging
 */

function sendVariablesToRequestBin(user, context, callback) {
  const _ = require('lodash');
  const request = require('request');

  // https://auth0.com/docs/user-profile/user-profile-structure
  const user_whitelist = ['user_id', 'email', 'email_verified'];
  const user_filtered = _.pick(user, user_whitelist);

  // https://auth0.com/docs/rules/current/context
  const context_whitelist = ['clientID', 'connection', 'stats'];
  const context_filtered = _.pick(context, context_whitelist);

  request.post(
    {
      url: 'https://requestbin.fullcontact.com/YourBinUrl',
      json: {
        user: user_filtered,
        context: context_filtered
      },
      timeout: 15000
    },
    function (err, response, body) {
      if (err) return callback(err);
      return callback(null, user, context);
    }
  );
}
