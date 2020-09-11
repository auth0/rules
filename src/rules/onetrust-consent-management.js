/**
 * @title OneTrust Consent Management
 * @overview Enhance Auth0 user profiles with consent, opt-ins and communication preferences data.
 * @gallery true
 * @category marketplace
 */
/* global configuration */
async function oneTrustConsentManagement(user, context, callback) {
  const { Auth0RedirectRuleUtilities } = require("@auth0/rule-utilities@0.1.0");
  const axios = require("axios@0.19.2");

  const {
    ONETRUST_REQUEST_INFORMATION,
    ONETRUST_CONSENT_API_URL,
    ONETRUST_PURPOSE_ID,
  } = configuration;

  const addIdTokenClaim = configuration.ONETRUST_ADD_ID_TOKEN_CLAIM === "true";
  const idTokenStatusClaim = "https://onetrust.com/status";
  const idTokenLinkClaim = "https://onetrust.com/magic-link";

  user.app_metadata = user.app_metadata || {};
  user.app_metadata.onetrust = user.app_metadata.onetrust || {};

  if (context.stats.loginsCount > 1) {
    return callback(null, user, context);
  }

  const response = await axios.post(ONETRUST_CONSENT_API_URL, {
    identifier: user.email,
    requestInformation: ONETRUST_REQUEST_INFORMATION,
    purposes: [{ Id: ONETRUST_PURPOSE_ID }],
  });

  return callback(null, user, context);
}
