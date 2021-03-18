/**
 * @title Incognia Login Rule
 * @overview Verify if the device logging in is at a trusted location.
 * @gallery true
 * @category marketplace
 *
 */
async function incogniaLoginRule(user, context, callback) {
  const _ = require('lodash@4.17.19')

  const { IncogniaAPI } = require('@incognia/api@1.0.0')
  const { Auth0UserUpdateUtilities } = require('@auth0/rule-utilities@0.2.0')

  const { INCOGNIA_CLIENT_ID, INCOGNIA_CLIENT_SECRET } = configuration;

  if (!INCOGNIA_CLIENT_ID || !INCOGNIA_CLIENT_SECRET) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  // For this rule to be used, please set 'incognia_login_rule' as 'enabled' in your Auth0
  // application metadata. This can be done in the advanced settings of your app.
  const incogniaLoginRule = _.get(context, 'clientMetadata.incognia_login_rule');
  if (!incogniaLoginRule || incogniaLoginRule !== 'enabled') {
    console.log('Incognia login rule is not enabled for this client. Skipping');
    return callback(null, user, context);
  }

  const installationId = _.get(context, 'request.query.installation_id');
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
    // TODO: should this be in context.idToken instead? This is information about the request,
    // not the user.
    const userUtils = new Auth0UserUpdateUtilities(user, auth0, 'incognia');
    userUtils.setAppMeta('assessment', loginAssessment);
  } catch (error) {
    console.log('Error calling Incognia API for a new login.');
    return callback(error);
  }

  return callback(null, user, context);
}
