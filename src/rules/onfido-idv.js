/**
 * @title Onfido Identity Verification
 * @overview Redirect to your Onfido IDV Application for Identity Verification during login.
 * @gallery true
 * @category marketplace
 *
 * Please see the [Onfido integration](https://marketplace.auth0.com/integrations/onfido-identity-verification) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SESSION_TOKEN_SECRET` Long, random string, should match on Onfido app side.
 *    - `ONFIDO_API_TOKEN` Your Onfido API Token
 *    - `ONFIDO_REGION` The supported Onfido region your tenant is operating in
 *    - `ONFIDO_ID_VERIFICATION_URL` URL to receive the redirect
 *
 * @param {object} user
 * @param {object} context
 * @param {function} callback
 */
 /* global configuration */
async function onfidoIdentityVerification(user, context, callback) {

  if (
    !configuration.SESSION_TOKEN_SECRET ||
    !configuration.ONFIDO_API_TOKEN ||
    !configuration.ONFIDO_REGION ||
    !configuration.ONFIDO_ID_VERIFICATION_URL
  ) {
    console.log("Missing required configuration. Skipping.");
    return callback(null, user, context);
  }

  // using auth0 rule-utilities to make sure our rule is efficient in the pipeline
  const { Auth0RedirectRuleUtilities } = require('@auth0/rule-utilities@0.1.0');
  // requiring Onfido's node SDK for making the calls easier to Onfido's service.
  const { Onfido, Region } = require('@onfido/api@1.5.1');

  const ruleUtils = new Auth0RedirectRuleUtilities(user, context, configuration);

  // creating a claim namespace for adding the Onfido IDV check results back to the ID Token
  const claimNamespace = 'https://claims.onfido.com/';

  // creating a new Onfido client, the region here is where your Onfido instance is located. Possible values are EU for Europe, US for United States, and CA for Canada.
  const onfidoClient = new Onfido({
    apiToken: configuration.ONFIDO_API_TOKEN,
    region: Region[configuration.ONFIDO_REGION] || Region.EU,
  });

  user.app_metadata = user.app_metadata || {};
  user.app_metadata.onfido = user.app_metadata.onfido || {};

  if (ruleUtils.isRedirectCallback && ruleUtils.queryParams.session_token && "true" === ruleUtils.queryParams.onfido_idv) {
    // User is back from the Onfido experience and has a session token to validate and assign to user meta

    // Validating session token and extracting payload for check results
    let payload;
    try {
      payload = ruleUtils.validateSessionToken();
    } catch (error) {
      return callback(error);
    }

    // assigning check status and result to the app_metadata so the downstream application can decided what to do next
    // note, in the example integration, the Onfido app returns after 30 seconds even if the check is still in progress
    // If this claim status is still in_progress it is recommended the downstream application recheck for completion or implement the Onfido Webhook: https://documentation.onfido.com/#webhooks
    // Additionally, you can place these items into the idToken claim with custom claims as needed as shown
    const onfido = {
      check_result: payload.checkResult,
      check_status: payload.checkStatus,
      applicant_id: payload.applicant,
    };
    try {
      await auth0.users.updateAppMetadata(user.user_id, onfido);
    } catch (error) {
      callback(error);
    }

    user.app_metadata.onfido = onfido;

    context.idToken[claimNamespace + 'check_result'] = payload.checkResult;
    context.idToken[claimNamespace + 'check_status'] = payload.checkStatus;
    context.idToken[claimNamespace + 'applicant_id'] = payload.applicant;

    return callback(null, user, context);
  }

  if (ruleUtils.canRedirect && !user.app_metadata.onfido.check_status) {
    // if the user has not already been redirected and check_status is empty, we will create the applicant and redirect to the Onfido implementation.
    let applicant;
    try {
      applicant = await onfidoClient.applicant.create({
        // these values do not need to match what is on the document for IDV, but if Data Comparison on Onfido's side is tuned on, these values will flag
        // if Auth0 contains these values in the app_metadata or on the user object you can map them here as needed. You could also pass them in as query_string variables
        firstName: !user.given_name ? 'anon' : user.given_name,
        lastName: !user.family_name ? 'anon' : user.family_name,
        email: !user.email ? 'anon@example.com' : user.email,
      });

      // create the session token with the applicant id as a custom claim
      const sessionToken = ruleUtils.createSessionToken({ applicant: applicant.id });
      // redirect to Onfido implementation with sessionToken
      ruleUtils.doRedirect(configuration.ONFIDO_ID_VERIFICATION_URL, sessionToken);
      return callback(null, user, context);
    } catch (error) {
      return callback(error);
    }
  }
  return callback(null, user, context);
}
