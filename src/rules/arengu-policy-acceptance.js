/**
 * @title Arengu Policy Acceptance
 * @overview Require your users to accept custom privacy policies or new terms.
 * @gallery true
 * @category marketplace
 *
 * Please see the [Aregnu Policy Acceptance integration](https://marketplace.auth0.com/integrations/arengu-policy-acceptance) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SESSION_TOKEN_SECRET`: A long, random string at least 32 bytes long
 *    - `ARENGU_POLICIES_FORM_URL`: The URL that contains an [embedded form](https://github.com/arengu/forms-js-sdk#embed-a-form) or with a [hosted form page](https://www.arengu.com/pages)
 *
 */

async function arenguCheckUserPolicies(user, context, callback) {
  if (
    !configuration.SESSION_TOKEN_SECRET ||
    !configuration.ARENGU_POLICIES_FORM_URL
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

  function mustAcceptNewPolicies() {
    // Use .getAppMeta() or .getUserMeta() as appropriate and modify the property key and value to your needs.
    return userUtils.getAppMeta('terms_accepted') !== true;
  }

  function validateSessionToken() {
    try {
      return ruleUtils.validateSessionToken();
    } catch (error) {
      callback(error);
    }
  }

  if (ruleUtils.isRedirectCallback && ruleUtils.queryParams.session_token) {
    const decodedToken = validateSessionToken();
    const customClaims = decodedToken.other;

    for (const [key, value] of Object.entries(customClaims)) {
      // Use .setAppMeta() or .setUserMeta() as appropriate
      userUtils.setAppMeta(key, value);
    }

    try {
      // Use .updateAppMeta() or .updateUserMeta() as appropriate
      await userUtils.updateAppMeta();

      return callback(null, user, context);
    } catch (error) {
      return callback(error);
    }
  }

  if (mustAcceptNewPolicies()) {
    ruleUtils.doRedirect(configuration.ARENGU_POLICIES_FORM_URL);

    return callback(null, user, context);
  }

  return callback(null, user, context);
}
