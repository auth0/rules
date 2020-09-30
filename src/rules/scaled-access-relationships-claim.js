/**
 * @title Scaled Access relationship-based claims
 * @overview Adds a claim based on the relationships the subject has in Scaled Access
 * @gallery true
 * @category marketplace
 *
 * Please see the [Scaled Access integration](https://marketplace.auth0.com/integrations/scaled-access) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SCALED_ACCESS_AUDIENCE` The identifier of the Auth0 API
 *    - `SCALED_ACCESS_CLIENTID` The Client ID of the Auth0 machine-to-machine application.
 *    - `SCALED_ACCESS_CLIENTSECRET` The Client secret of the Auth0 machine-to-machine application.
 *    - `SCALED_ACCESS_BASEURL` The base URL for the Relationship Management API.
 *    - `SCALED_ACCESS_TENANT` Your tenant code provided by Scaled Access.
 *
 * **Optional configuration:**
 *
 *    - `SCALED_ACCESS_CUSTOMCLAIM` A namespaced ID token claim (defaults to `https://scaledaccess.com/relationships`)
 */
function scaledAccessAddRelationshipsClaim(user, context, callback) {
  if (
    !configuration.SCALED_ACCESS_AUDIENCE ||
    !configuration.SCALED_ACCESS_CLIENTID ||
    !configuration.SCALED_ACCESS_CLIENTSECRET ||
    !configuration.SCALED_ACCESS_BASEURL ||
    !configuration.SCALED_ACCESS_TENANT
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const fetch = require('node-fetch');
  const { URLSearchParams } = require('url');

  const getM2mToken = () => {
    if (global.scaledAccessM2mToken && global.scaledAccessM2mTokenExpiryInMillis > new Date().getTime() + 60000) {
      return Promise.resolve(global.scaledAccessM2mToken);
    } else {
      const tokenUrl = `https://${context.request.hostname}/oauth/token`;
      return fetch(tokenUrl, {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: configuration.SCALED_ACCESS_CLIENTID,
          client_secret: configuration.SCALED_ACCESS_CLIENTSECRET,
          audience: configuration.SCALED_ACCESS_AUDIENCE,
          scope: 'pg:tenant:admin'
        })
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((error) => {
              console.error('Failed to obtain m2m token from ' + tokenUrl);
              throw Error(error);
            });
          } else {
            return response.json();
          }
        })
        .then(({ access_token, expires_in }) => {
          global.scaledAccessM2mToken = access_token;
          global.scaledAccessM2mTokenExpiryInMillis = new Date().getTime() + expires_in * 1000;
          return access_token;
        });
    }
  };

  const callRelationshipManagementApi = async (accessToken, path) => {
    const url = `${configuration.SCALED_ACCESS_BASEURL}/${configuration.SCALED_ACCESS_TENANT}/${path}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(async (response) => {
      if (response.status === 404) {
        return [];
      } else if (!response.ok) {
        return response.text().then((error) => {
          console.error('Failed to call relationship management API', url);
          throw Error(error);
        });
      } else {
        return response.json();
      }
    });
  };

  const getRelationships = (accessToken) => {
    return callRelationshipManagementApi(accessToken, `actors/user/${user.user_id}/relationships`);
  };

  const addClaimToToken = (apiResponse) => {
    const claimName = configuration.SCALED_ACCESS_CUSTOMCLAIM || `https://scaledaccess.com/relationships`;
    context.accessToken[claimName] = apiResponse.map((relationship) => ({
      relationshipType: relationship.relationshipType,
      to: relationship.to
    }));
  };

  getM2mToken()
    .then(getRelationships)
    .then(addClaimToToken)
    .then(() => {
      callback(null, user, context);
    })
    .catch((err) => {
      console.error(err);
      console.log('Using configuration: ', JSON.stringify(configuration));
      callback(null, user, context); // fail gracefully, token just won't have extra claim
    });
}
