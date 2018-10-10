/**
 * @overview Send SignUp and Login events to Splunk's [HTTP Event Collector] (http://dev.splunk.com/view/event-collector/SP-CAAAE7F), including some contextual information of the user
 * @gallery true
 * @category webhook
 *
 * Tracks Logins/SignUps with Splunk HEC
 *
 * This rule will send a `SignUp` & `Login` events to Splunk's HTTP Event Collector, including some contextual information of the user: the application the user is signing in, client IP address, username, etc.
 *
 * We use a persistent property `SignedUp` to track whether this is the first login or subsequent ones.
 * Events will show up on the Splunk console shortly after user access:
 *
 * Setup
 *
 * In order to use this rule, you need to enable HTTP Event Collector (HEC) on your Splunk instance and get an HEC token. You can learn more how to do this [here](http://dev.splunk.com/view/event-collector/SP-CAAAE7F)
 * Below is a screenshot showing an SingUp event sent to Splunk Cloud.
 * https://cdn.auth0.com/website/rules/splunk-hec-rule.png
 */

function (user, context, callback) {
  const request = require('request');

  user.app_metadata = user.app_metadata || {};
  const endpoint = 'https://http-inputs-mysplunkcloud.example.com:443/services/collector'; // replace with your Splunk HEC endpoint;

  //Add any interesting info to the event
  const hec_event = {
    event: {
      message: user.app_metadata.signedUp ? 'Login' : 'SignUp',
      application: context.clientName,
      clientIP: context.request.ip,
      protocol: context.protocol,
      userName: user.name,
      userId: user.user_id
    },
    source: 'auth0',
    sourcetype: 'auth0_activity'
  };

  request.post({
    url: endpoint,
    headers: {
      'Authorization': 'Splunk ' + configuration.SPLUNK_HEC_TOKEN
    },
    strictSSL: true, // set to false if using a self-signed cert
    json: hec_event
  }, function(error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) return callback(new Error('Invalid operation'));
    user.app_metadata.signedUp = true;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function () {
        callback(null, user, context);
      })
      .catch(function (err) {
        callback(err);
      });
  });

}
