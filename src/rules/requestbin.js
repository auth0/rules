/**
 * @overview Shows how to post the variables sent to your Rule to https://requestbin.fullcontact.com to help troubleshoot rule issues
 * @gallery true
 * @category enrich profile
 *
 * Dump rule variables to RequestBin
 *
 * This rule shows how to post the variables sent to your Rule to https://requestbin.fullcontact.com to help troubleshoot issues with your Rules.
 *
 * You can run this rule by itself, or paste it into an existing rule. Once the rule has posted data to RequestBin, you can use a site like http://bodurov.com/JsonFormatter/ to more easily visualize the data.
 *
 * > Note: You should deactivate this rule or comment out the code once you are finished troubleshooting.
 *
 * Contributed by Robert McLaws, AdvancedREI.com
 */

function (user, context, callback) {
  const request = require('request');

  request.post({
    url: 'http://requestbin.fullcontact.com/YourBinUrl',
    json: {
      user: user,
      context: context,
    },
    timeout: 15000
  }, function(err, response, body){
    if (err) return callback(new Error(err));
    return callback(null, user, context);
  });
}
