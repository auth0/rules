/**
 * @title Require MFA once per session
 * @overview Require multifactor authentication only once per session
 * @gallery true
 * @category multifactor
 *
 * This rule can be used to avoid prompting a user for multifactor authentication if they have successfully completed MFA in their current session.
 *
 * This is particularly useful when performing silent authentication (`prompt=none`) to renew short-lived access tokens in a SPA (Single Page Application) during the duration of a user's session without having to rely on setting `allowRememberBrowser` to `true`.
 *
 */

function requireMfaOncePerSession(user, context, callback) {
  const completedMfa = !!context.authentication.methods.find((method) => method.name === "mfa");

  if (completedMfa) {
    return callback(null, user, context);
  }

  context.multifactor = {
    provider: "any",
    allowRememberBrowser: false
  };

  callback(null, user, context);
}
