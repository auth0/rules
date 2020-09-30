/**
 * @title Slack Notification on User Signup
 * @overview Slack notification on user signup.
 * @gallery true
 * @category webhook
 *
 * This rule sends a message to a slack channel on every user signup.
 *
 */

function slackNotificationOnUserSignup(user, context, callback) {
  // short-circuit if the user signed up already or is using a refresh token
  if (
    context.stats.loginsCount > 1 ||
    context.protocol === 'oauth2-refresh-token'
  ) {
    return callback(null, user, context);
  }

  // get your slack's hook url from: https://slack.com/services/10525858050
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
