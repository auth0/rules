/**
 * @overview Shows how to post the variables sent to your Rule to https://requestbin.fullcontact.com to help troubleshoot rule issues
 * @gallery true
 * @category debugging
 *
 * Dump rule variables to RequestBin
 *
 * > Please note: Auth0 provides [native mechanisms for debugging rules](https://auth0.com/docs/rules/current#how-to-debug-rules). Should you still desire to send internal rule variables to a third-party service, you should deactivate this rule or comment out the code once you are finished troubleshooting.
 *
 * This rule shows how to post the variables sent to your Rule to https://requestbin.fullcontact.com to help troubleshoot issues with your Rules.
 *
 * You can run this rule by itself, or paste it into an existing rule.
 *
 */

function (user, context, callback) {
  const request = require('request');

  function filter(dict, whitelist) {
    var filtered = {};
    Object.keys(dict).forEach(function(key) {
      if (whitelist.indexOf(key) >= 0) {
        filtered[key] = dict[key];
      }
    });
    return filtered;
  }

  // https://auth0.com/docs/user-profile/user-profile-structure
  const user_whitelist = ['user_id', 'email', 'email_verified'];
  const user_filtered  = filter(user, user_whitelist);

  // https://auth0.com/docs/rules/current/context
  const context_whitelist = ['clientID', 'connection', 'stats'];
  const context_filtered  = filter(context, context_whitelist);

  request.post({
    url: 'https://requestbin.fullcontact.com/YourBinUrl',
    json: {
      user: user_filtered,
      context: context_filtered,
    },
    timeout: 15000
  }, function(err, response, body){
    if (err) return callback(err);
    return callback(null, user, context);
  });
}
