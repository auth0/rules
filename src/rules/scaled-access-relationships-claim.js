/**
* @title Scaled Access relationship-based claims
* @overview Adds a claim based on the relationships the subject has in Scaled Access
* @gallery true
* @category marketplace
*
* This rule adds a claim to the access token based on relationships the subject has in Scaled Access.
* 
* Example of a resulting claim:
* ```
* "https://example.com/relationships": [
*    {
*      "relationshipType": "is_admin_of",
*      "to": {
*        "id": "c7b134f9-28a2-4dcc-b345-affa18977ddf",
*        "type": "subscription"
*      }
*    },
*    {
*      "relationshipType": "is_sports_member_of",
*      "to": {
*        "id": "affa18977ddf-4dcc-b345-c7b134f9-28a2",
*        "type": "subscription"
*      }
*    }
* ]
* ```
* This is done through an API call to Scaled Access' Relationship Management API using a machine-to-machine token.
* More info can be found at https://docs.scaledaccess.com/?path=integration-with-auth0
* 
* A number of rule settings are required:
* - SCALED_ACCESS_CLIENTID: The Client ID of the machine-to-machine application.
* - SCALED_ACCESS_CLIENTSECRET: The Client secret of the machine-to-machine application.
* - SCALED_ACCESS_BASEURL: The base URL for the Relationship Management API, e.g. `https://api.int.scaledaccess.com/privategroups-v2`.
* - SCALED_ACCESS_TENANT: Your Scaled Access tenant code.
* - SCALED_ACCESS_CUSTOMCLAIM: A namespaced custom claim name of your choice. The name must be a URL. Defaults to `https://scaledaccess.com/relationships`.
* - SCALED_ACCESS_AUDIENCE: The audience in the machine-to-machine token.
*/
function scaledAccessAddRelationshipsClaim(user, context, callback) {
    const fetch = require("node-fetch");
    const { URLSearchParams } = require('url');
    const jwt = require('jsonwebtoken');

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
                .then(response => {
                    if (!response.ok) {
                        return response.text().then((error) => {
                            console.error("Failed to obtain m2m token from " + tokenUrl);
                            throw Error(error);
                        });
                    } else {
                        return response.json();
                    }
                })
                .then(({ access_token }) => {
                    global.scaledAccessM2mToken = access_token;
                    global.scaledAccessM2mTokenExpiryInMillis = jwt.decode(access_token).exp * 1000;
                    return access_token;
                });
        }
    };

    const callRelationshipManagementApi = async (accessToken, path) => {
        const url = `${configuration.SCALED_ACCESS_BASEURL}/${configuration.SCALED_ACCESS_TENANT}/${path}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(async response => {
                if (response.status === 404) {
                    return [];
                } else if (!response.ok) {
                    return response.text().then((error) => {
                        console.error("Failed to call relationship management API", url);
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
        context.accessToken[claimName] = apiResponse.map(relationship => ({
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
        .catch(err => {
            console.error(err);
            console.log("Using configuration: ", JSON.stringify(configuration));
            callback(null, user, context); // fail gracefully, token just won't have extra claim
        });
}
