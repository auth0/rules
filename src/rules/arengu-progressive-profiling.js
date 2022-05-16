/**
 *
 * Please see the [Aregnu Progressive Profiling integration](https://marketplace.auth0.com/integrations/arengu-progressive-profiling) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SESSION_TOKEN_SECRET`: A long, random string at least 32 bytes long
 *    - `ARENGU_PROFILE_FORM_URL`: The URL that contains an [embedded form](https://github.com/arengu/forms-js-sdk#embed-a-form) or with a [hosted form page](https://www.arengu.com/pages)
 *
 * @title Arengu Progressive Profiling
 * @overview Capture new users' information in your authentication flows.
 * @gallery false
 * @category marketplace
 */

async function arenguCompleteUserProfile(user, context, callback) {
  if (
    !configuration.SESSION_TOKEN_SECRET ||
    !configuration.ARENGU_PROFILE_FORM_URL
  ) {
    console.log('Missing required configuration. Skipping.');
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

  const userUtils = new Auth0UserUpdateUtilities(user, auth0);

  function validateSessionToken() {
    try {
      return ruleUtils.validateSessionToken();
    } catch (error) {
      callback(error);
    }
  }

  // Modify your login criteria to your needs
  function isLogin() {
    const loginCount = configuration.ARENGU_PROFILE_LOGIN_COUNT || 2;
    return context.stats.loginsCount > parseInt(loginCount, 10);
  }

  function isEmptyUserMeta(key) {
    return (
      userUtils.getUserMeta(key) === undefined ||
      userUtils.getUserMeta(key) === null ||
      userUtils.getUserMeta(key).length === 0
    );
  }

  function isProfileIncomplete() {
    // Add your required user_medata keys
    return isEmptyUserMeta('job_title') || isEmptyUserMeta('company_name');
  }

  if (ruleUtils.isRedirectCallback && ruleUtils.queryParams.session_token) {
    const decodedToken = validateSessionToken();
    const customClaims = decodedToken.other;

    for (const [key, value] of Object.entries(customClaims)) {
      userUtils.setUserMeta(key, value);
    }

    try {
      await userUtils.updateUserMeta();

      return callback(null, user, context);
    } catch (error) {
      return callback(error);
    }
  }

  if (isLogin() && isProfileIncomplete()) {
    ruleUtils.doRedirect(configuration.ARENGU_PROFILE_FORM_URL);
  }

  return callback(null, user, context);
}
