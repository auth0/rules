/**
 * @title Incognia Authentication Rule
 * @overview Verify if the device logging in is at a trusted location.
 * @gallery true
 * @category marketplace
 *
 * Please see the [Incognia Authentication integration](https://marketplace.auth0.com/integrations/incognia-authentication) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `INCOGNIA_CLIENT_ID`: The client ID obtained from Incognia's dashboard (My Apps > API Credentials)
 *    - `INCOGNIA_CLIENT_SECRET`: The client secret obtained from Incognia's dashboard (My Apps > API Credentials)
 */

async function incogniaAuthenticationRule(user, context, callback) {
  const _ = require('lodash@4.17.19');

  const { IncogniaAPI } = require('@incognia/api@1.0.0');

  const { INCOGNIA_CLIENT_ID, INCOGNIA_CLIENT_SECRET } = configuration;

  if (!INCOGNIA_CLIENT_ID || !INCOGNIA_CLIENT_SECRET) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const installationId = _.get(
    context,
    'request.query.incognia_installation_id'
  );
  if (!installationId) {
    console.log('Missing installation_id. Skipping.');
    return callback(null, user, context);
  }

  const accountId = _.get(user, 'user_id');
  if (!accountId) {
    console.log('Missing user_id. Skipping.');
    return callback(null, user, context);
  }

  let incogniaAPI;
  if (global.incogniaAPI) {
    incogniaAPI = global.incogniaAPI;
  } else {
    incogniaAPI = new IncogniaAPI({
      clientId: INCOGNIA_CLIENT_ID,
      clientSecret: INCOGNIA_CLIENT_SECRET
    });
    global.incogniaAPI = incogniaAPI;
  }

  try {
    const loginAssessment = await incogniaAPI.registerLoginAssessment({
      installationId: installationId,
      accountId: accountId
    });

    // Incognia's risk assessment will be in a namespaced claim so it can be used in other rules
    // for skipping/prompting MFA or in the mobile app itself to decide whether the user should be
    // redirected to step-up auth for example.
    context.idToken['https://www.incognia.com/assessment'] =
      loginAssessment.riskAssessment;
  } catch (error) {
    console.log('Error calling Incognia API for a new login.');
    return callback(error);
  }

  return callback(null, user, context);
}
