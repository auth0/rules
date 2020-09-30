/**
 * @title Send events to Keen
 * @overview Send a signup event to Keen IO, tracked by the user.signedUp property
 * @gallery true
 * @category webhook
 *
 * This rule is used to send a `signup` event to [Keen IO](http://keen.io)
 *
 * The rule checks whether the user has already signed up before or not. This is tracked by the persistent `user.signedUp` property.
 * If the property is present, everything else is skipped. If not, then we POST a new event with some information to a `signups Collection` on Keen IO.
 *
 * Once enabled, events will be displayed on Keen IO dashboard:
 *
 * ![](http://puu.sh/7k4qN.png)
 *
 */

function sendEventsToKeen(user, context, callback) {
  if (context.stats.loginsCount > 1) {
    return callback(null, user, context);
  }

  const request = require('request');

  const MY_SLACK_WEBHOOK_URL = configuration.SLACK_WEBHOOK_URL;
  const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

  const projectId = configuration.KEEN_PROJ_ID;
  const writeKey = configuration.KEEN_WRITE_KEY;
  const eventCollection = 'signups';

  const keenEvent = {
    userId: user.user_id,
    name: user.name,
    ip: context.request.ip // Potentially any other properties in the user profile/context
  };

  request.post(
    {
      url: 'https://api.keen.io/3.0/projects/' + projectId + '/events/' + eventCollection,
      headers: {
        'Content-type': 'application/json',
        Authorization: writeKey
      },
      body: JSON.stringify(keenEvent)
    },
    function (error, response, body) {
      if (error || (response && response.statusCode !== 200)) {
        slack.alert({
          channel: '#some_channel',
          text: 'KEEN API ERROR',
          fields: {
            error: error ? error.toString() : response ? response.statusCode + ' ' + body : ''
          }
        });
      }
    }
  );

  callback(null, user, context);
}
