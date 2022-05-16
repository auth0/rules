/**
 *
 * This rule sends a message to a Slack channel on every user signup.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SLACK_HOOK_URL` URL to the Slack hook to notify.
 * 
 * @title Slack Notification on User Signup
 * @overview Slack notification on user signup.
 * @gallery true
 * @category webhook
 */

function slackNotificationOnUserSignup(user, context, callback) {
  // short-circuit if the user signed up already or is using a refresh token
  if (
    context.stats.loginsCount > 1 ||
    context.protocol === 'oauth2-refresh-token' ||
    context.protocol === 'redirect-callback' ||
    context.request.query.prompt === 'none'
  ) {
    return callback(null, user, context);
  }

  if (!configuration.SLACK_HOOK_URL) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  // https://api.slack.com/messaging/webhooks
  const SLACK_HOOK = configuration.SLACK_HOOK_URL;

  const slack = require('slack-notify')(SLACK_HOOK);
  const message =
    'New User: ' + (user.name || user.email) + ' (' + user.email + ')';
  const channel = '#some_channel';

  slack.success({
    text: message,
    channel: channel
  });

  // don’t wait for the Slack API call to finish, return right away (the request will continue on the sandbox)`
  callback(null, user, context);
}
