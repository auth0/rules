/**
* @title Consentric Progressive Consent
* @overview Uses a widget to capture missing consents and preferences at login to boost engagement and support compliance
* @gallery true
* @category marketplace
*
* Please see the [MyLife Digital integration](https://marketplace.auth0.com/integrations/mylife-digital-progressive-consent) for more information and detailed installation instructions.

* **Required configuration** (this Rule will be skipped if any of the below are not defined):
*
*    - `CONSENTRIC_AUTH_HOST` The URL to authenticate against for your Consentric API token, like `https://sandbox-consentric.eu.auth0.com`
*    - `CONSENTRIC_API_HOST` The Consentric API host URL, like `https://sandbox.consentric.io`
*    - `CONSENTRIC_CLIENT_ID` The Consentric ClientId issued to you
*    - `CONSENTRIC_CLIENT_SECRET` The Consentric ClientSecret issued to you
*    - `CONSENTRIC_AUDIENCE` The name of the Consentric API being called, like `https://sandbox.consentric.io`
*    - `CONSENTRIC_APPLICATION_ID` The Consentric ApplicationId issued to you
*    - `CONSENTRIC_REDIRECT_URL` The URL of the page containing the Progressive widget
*
*/
function consentricProgressiveConsent(user, context, callback) {
  const axios = require('axios@0.19.2');
  const moment = require('moment@2.11.2');
  const { Auth0RedirectRuleUtilities } = require('@auth0/rule-utilities@0.1.0');

  const ruleUtils = new Auth0RedirectRuleUtilities(user, context, configuration);

  const asMilliSeconds = (seconds) => seconds * 1000;

  const {
    CONSENTRIC_AUTH_HOST,
    CONSENTRIC_API_HOST,
    CONSENTRIC_AUDIENCE,
    CONSENTRIC_CLIENT_ID,
    CONSENTRIC_CLIENT_SECRET,
    CONSENTRIC_APPLICATION_ID,
    CONSENTRIC_REDIRECT_URL
  } = configuration;

  if (
    !CONSENTRIC_AUTH_HOST ||
    !CONSENTRIC_API_HOST ||
    !CONSENTRIC_AUDIENCE ||
    !CONSENTRIC_CLIENT_ID ||
    !CONSENTRIC_CLIENT_SECRET ||
    !CONSENTRIC_APPLICATION_ID ||
    !CONSENTRIC_REDIRECT_URL
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const consentricAuth = axios.create({
    baseURL: CONSENTRIC_AUTH_HOST,
    timeout: 1000
  });

  const consentricApi = axios.create({
    baseURL: CONSENTRIC_API_HOST,
    timeout: 1000
  });

  // Returns Consentric API Access Token (JWT) from either the global cache or generates it anew from clientId and secret
  const getConsentricApiAccessToken = async () => {
    const consentricApiTokenNotValid = !global.consentricApiToken || global.consentricApiToken.exp < Date.now();

    if (consentricApiTokenNotValid) {
      try {
        // Exchange Credentials for Consentric Api Access token
        const {
          data: { expires_in, access_token }
        } = await consentricAuth.post('/oauth/token', {
          grant_type: 'client_credentials',
          client_id: CONSENTRIC_CLIENT_ID,
          client_secret: CONSENTRIC_CLIENT_SECRET,
          audience: CONSENTRIC_AUDIENCE,
          applicationId: CONSENTRIC_APPLICATION_ID
        });

        const expiryInMs = new Date().getTime() + asMilliSeconds(expires_in);
        const auth = {
          jwt: access_token,
          exp: expiryInMs
        };

        // Persist API Access token in global properties
        global.consentricApiToken = auth;
      } catch (error) {
        console.error(
          'Unable to retrieve API Access token for Consentric. Please check that your credentials (CONSENTRIC_CLIENT_ID and CONSENTRIC_CLIENT_SECRET) are correct.'
        );
        throw error;
      }
    }

    return global.consentricApiToken;
  };

  // Creates Citizen Record in Consentric with Auth0 Id
  const createCitizen = ({ userRef, apiAccessToken }) => {
    console.log(`Upserting Consentric Citizen record for ${userRef}`);
    const data = {
      applicationId: CONSENTRIC_APPLICATION_ID,
      externalRef: userRef
    };

    return consentricApi
      .post('/v1/citizens', data, {
        headers: {
          Authorization: 'Bearer ' + apiAccessToken
        }
      })
      .catch((err) => {
        if (err.response.status !== 409) {
          // 409 indicates Citizen with given reference already exists in Consentric
          console.error(err);
          throw err;
        }
      });
  };

  // Function to retrieve Consentric User Token from User Metadata
  const getConsentricUserTokenFromMetadata = (user) => user.app_metadata && user.app_metadata.consentric;

  // Generates On Demand Consentric User Token for the given User using the API Access Token
  const generateConsentricUserAccessToken = async ({ userRef, apiAccessToken }) => {
    try {
      console.log(`Attempting to generate access token API for ${userRef}`);

      const {
        data: { token, expiryDate: exp }
      } = await consentricApi.post(
        '/v1/access-tokens/tokens',
        {
          applicationId: CONSENTRIC_APPLICATION_ID,
          externalRef: userRef,
          expiryDate: moment().add(3, 'months').toISOString()
        },
        {
          headers: {
            Authorization: 'Bearer ' + apiAccessToken
          }
        }
      );

      return {
        token,
        exp
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const loadConsentricUserAccessToken = async ({ user }) => {
    try {
      const metadataUserToken = getConsentricUserTokenFromMetadata(user);
      if (metadataUserToken && moment(metadataUserToken.exp).subtract(1, 'days').isAfter(moment()))
        return metadataUserToken;

      const { jwt: apiAccessToken } = await getConsentricApiAccessToken();
      const apiCredentials = {
        userRef: user.user_id,
        apiAccessToken
      };

      // Create Citizen with Auth0 UserId
      await createCitizen(apiCredentials);

      // Generate an On Demand Access Token for the created citizen
      const generatedToken = await generateConsentricUserAccessToken(apiCredentials);

      // Persist the app_metadata update
      await auth0.users.updateAppMetadata(user.user_id, { consentric: generatedToken });

      return generatedToken;
    } catch (err) {
      console.error(`Issue loading Consentric User Access Token for user ${user.user_id} - ${err}`);
      throw err;
    }
  };

  const initConsentricFlow = async () => {
    try {
      const { token } = await loadConsentricUserAccessToken({ user });
      const urlConnector = CONSENTRIC_REDIRECT_URL.includes('?') ? '&' : '?';
      const redirectUrl = CONSENTRIC_REDIRECT_URL + urlConnector + 'token=' + token;

      context.redirect = {
        url: redirectUrl
      };
    } catch (err) {
      console.error(`CONSENTRIC RULE ABORTED: ${err}`);
    }
    return callback(null, user, context);
  };

  if (ruleUtils.canRedirect) {
    return initConsentricFlow();
  } else {
    // Run after Redirect or Silent Auth
    return callback(null, user, context);
  }
}
