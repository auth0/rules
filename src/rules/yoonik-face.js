/**
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SESSION_TOKEN_SECRET` A random long string that is used to sign the session token sent
 *      to the custom app implementing YooniK Face Capture SDK. This value will also need to be
 *      used in the custom app in order to verify and re-sign the session token back to Auth0.
 *    - `YOONIK_APP_URL` The URL of your custom application that receives the redirect.
 *
 * @title YooniK Face Authentication
 * @overview Redirect to your YooniK Face Application for Face Authentication during login.
 * @gallery false
 * @category marketplace
 */
async function yoonikFaceAuthentication(user, context, callback) {
  if (!configuration.SESSION_TOKEN_SECRET || !configuration.YOONIK_APP_URL) {
    console.log('Please set required configuration parameters.');
    return callback(null, user, context);
  }

  const {
    Auth0RedirectRuleUtilities,
    Auth0UserUpdateUtilities
  } = require('@auth0/rule-utilities@0.2.0');

  const ruleUtils = new Auth0RedirectRuleUtilities(
    user,
    context,
    configuration
  );

  const userUtils = new Auth0UserUpdateUtilities(user, auth0, 'yoonik');

  const claimNamespace = 'https://claims.yoonik.me/';

  if (
    ruleUtils.isRedirectCallback &&
    ruleUtils.queryParams.session_token &&
    ruleUtils.queryParams.yoonik_authentication === 'true'
  ) {
    // User is back from the YooniK redirect and has a session token to validate.
    let payload;
    try {
      payload = ruleUtils.validateSessionToken();
    } catch (error) {
      callback(error);
    }

    userUtils.setAppMeta('status', payload.status);

    try {
      await userUtils.updateAppMeta();
    } catch (error) {
      callback(error);
    }

    context.idToken[claimNamespace + 'status'] = payload.status;

    callback(null, user, context);
  }

  if (ruleUtils.canRedirect) {
    try {
      ruleUtils.doRedirect(configuration.YOONIK_APP_URL);
      callback(null, user, context);
    } catch (error) {
      callback(error);
    }
  }

  return callback(null, user, context);
}
