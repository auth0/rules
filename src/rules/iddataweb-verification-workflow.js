/**
 * @title ID DataWeb Verification Workflow
 * @overview Verify your user's identity in 180+ countries with ID DataWeb's adaptive Verification Workflows.
 * @gallery false
 * @category marketplace
 *
 * Please see the [ID DataWeb integration](https://marketplace.auth0.com/integrations/iddataweb-identity-verification) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `IDDATAWEB_BASE_URL` Indicates the ID DataWeb environment. The default value is Pre-production - `https://prod2.iddataweb.com/prod-axn` - where all testing and POCs should take place. To switch to production, change the URL to `https://prod2.iddataweb.com/prod-axn`
 *    - `IDDATAWEB_CLIENT_ID` Identifies your specific verification workflow and user experience. Get this from the ID DataWeb’s AXN Admin console.
 *    - `IDDATAWEB_CLIENT_SECRET` Authenticates your specific verification workflow and user experience. Get this from ID DataWeb’s AXN Admin console.
 *
 * **Optional configuration:**
 *
 *    - `IDDATAWEB_ALWAYS_VERIFY` Controls if users are verified each time they login, or just initially. We recommend "true" (verify the user on every login) for testing, not set (verify once, then not again) for production.
 *
 */

async function iddatawebVerificationWorkflow(user, context, callback) {
  const {
    IDDATAWEB_BASE_URL,
    IDDATAWEB_CLIENT_ID,
    IDDATAWEB_CLIENT_SECRET,
    IDDATAWEB_ALWAYS_VERIFY
  } = configuration;

  if (!IDDATAWEB_BASE_URL || !IDDATAWEB_CLIENT_ID || !IDDATAWEB_CLIENT_SECRET) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const { Auth0RedirectRuleUtilities } = require('@auth0/rule-utilities@0.1.0');
  const axiosClient = require('axios@0.21.1');
  const url = require('url');

  const ruleUtils = new Auth0RedirectRuleUtilities(
    user,
    context,
    configuration
  );

  const idwBasicAuth = Buffer.from(
    IDDATAWEB_CLIENT_ID + ':' + IDDATAWEB_CLIENT_SECRET
  ).toString('base64');

  const idwTokenNamepsace = 'https://iddataweb.com/';
  const idwTokenEndpoint = `${IDDATAWEB_BASE_URL}/axn/oauth2/token`;
  const idwAuthorizeEndpoint = `${IDDATAWEB_BASE_URL}/axn/oauth2/authorize`;
  const auth0ContinueUrl = `https://${context.request.hostname}/continue`;

  let iddataweb = (user.app_metadata && user.app_metadata.iddataweb) || {};
  iddataweb.verificationResult = iddataweb.verificationResult || {};

  // if the user is already verified and we don't need to check, exit
  if (
    iddataweb.verificationResult.policyDecision === 'approve' &&
    IDDATAWEB_ALWAYS_VERIFY !== 'true'
  ) {
    console.log('user ' + user.user_id + ' has been previously verified.');
    return callback(null, user, context);
  }

  // if coming back from redirect - get token, make policy decision, and update user metadata.
  if (ruleUtils.isRedirectCallback) {
    console.log('code from IDW: ' + ruleUtils.queryParams.code);

    const formParams = new url.URLSearchParams({
      grant_type: 'authorization_code',
      code: ruleUtils.queryParams.code,
      redirect_uri: auth0ContinueUrl
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
      Authorization: `Basic ${idwBasicAuth}`
    };

    let decodedToken;
    try {
      const tokenResponse = await axiosClient.post(
        idwTokenEndpoint,
        formParams.toString(),
        { headers }
      );

      if (tokenResponse.data.error) {
        throw new Error(tokenResponse.data.error_description);
      }

      decodedToken = jwt.decode(tokenResponse.data.id_token);
    } catch (error) {
      return callback(error);
    }

    //check issuer, audience and experiation of ID DataWeb Token
    if (
      decodedToken.iss !== IDDATAWEB_BASE_URL ||
      decodedToken.aud !== IDDATAWEB_CLIENT_ID
    ) {
      return callback(new Error('ID token invalid.'));
    }

    console.log('policy decision: ' + decodedToken.policyDecision);
    console.log('score: ' + decodedToken.idwTrustScore);
    console.log('IDW transaction ID: ' + decodedToken.jti);

    // once verification is complete, update user's metadata in Auth0.
    //this could be used for downstream application authorization,
    //or mapping access to levels of assurance.
    iddataweb.verificationResult = {
      policyDecision: decodedToken.policyDecision,
      transactionid: decodedToken.jti,
      iat: decodedToken.iat
    };

    try {
      auth0.users.updateAppMetadata(user.user_id, { iddataweb });
    } catch (error) {
      return callback(error);
    }

    //include ID DataWeb results in Auth0 ID Token
    context.idToken[idwTokenNamepsace + 'policyDecision'] =
      decodedToken.policyDecision;
    context.idToken[idwTokenNamepsace + 'transactionId'] = decodedToken.jti;
    context.idToken[idwTokenNamepsace + 'iat'] = decodedToken.iat;

    return callback(null, user, context);
  }

  // ... otherwise, redirect for verification.

  let idwRedirectUrl =
    idwAuthorizeEndpoint +
    '?client_id=' +
    IDDATAWEB_CLIENT_ID +
    '&redirect_uri=' +
    auth0ContinueUrl +
    '&scope=openid+country.US&response_type=code';

  if (ruleUtils.canRedirect) {
    context.redirect = {
      url: idwRedirectUrl
    };
  }

  return callback(null, user, context);
}
