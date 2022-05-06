/**
 * @title OneTrust Consent Management
 * @overview Enhance Auth0 user profiles with consent, opt-ins and communication preferences data.
 * @gallery false
 * @category marketplace
 *
 * Please see the [OneTrust integration](https://marketplace.auth0.com/integrations/onetrust-consent-management) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `ONETRUST_REQUEST_INFORMATION` Your OneTrust Collection Point API token
 *    - `ONETRUST_CONSENT_API_URL` Your OneTrust Collection Point API URL
 *    - `ONETRUST_PURPOSE_ID` Your OneTrust Collection Point Purpose ID
 *
 * **Optional configuration:**
 *
 *    - `ONETRUST_SKIP_IF_NO_EMAIL` If set to "true" then the Rule will be skipped if there is no email address. Otherwise the Rule will fail with an error.
 */
/* global configuration */
async function oneTrustConsentManagement(user, context, callback) {
  const axios = require('axios@0.21.1');

  const {
    ONETRUST_REQUEST_INFORMATION,
    ONETRUST_CONSENT_API_URL,
    ONETRUST_PURPOSE_ID
  } = configuration;

  if (
    !ONETRUST_REQUEST_INFORMATION ||
    !ONETRUST_CONSENT_API_URL ||
    !ONETRUST_PURPOSE_ID
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const skipIfNoEmail = configuration.ONETRUST_SKIP_IF_NO_EMAIL === 'true';

  user.app_metadata = user.app_metadata || {};
  let onetrust = user.app_metadata.onetrust || {};

  if (onetrust.receipt) {
    console.log('User has a Collection Point receipt. Skipping.');
    return callback(null, user, context);
  }

  if (!user.email) {
    if (skipIfNoEmail) {
      console.log('User has no email address. Skipping.');
      return callback(null, user, context);
    }
    return callback(new Error('An email address is required.'));
  }

  try {
    const response = await axios.post(ONETRUST_CONSENT_API_URL, {
      identifier: user.email,
      requestInformation: ONETRUST_REQUEST_INFORMATION,
      purposes: [{ Id: ONETRUST_PURPOSE_ID }]
    });
    onetrust.receipt = response.data.receipt;
  } catch (error) {
    console.log('Error calling the Collection Point.');
    return callback(error);
  }

  try {
    await auth0.users.updateAppMetadata(user.user_id, { onetrust });
  } catch (error) {
    console.log('Error updating user app_metadata.');
    return callback(error);
  }

  return callback(null, user, context);
}
