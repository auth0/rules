/**
* @title Adds a claim based on relationships
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
* - GROUPS4AUTH0_CLIENTID: The Client ID of the machine-to-machine application.
* - GROUPS4AUTH0_CLIENTSECRET: The Client secret of the machine-to-machine application.
* - GROUPS4AUTH0_BASEURL: The base URL for the Relationship Management API, e.g. https://api.int.scaledaccess.com/privategroups-v2.
* - GROUPS4AUTH0_TENANT: Your Scaled Access tenant code.
* - GROUPS4AUTH0_CUSTOMCLAIM: A namespaced custom claim name of your choice. The name must be a URL.
* - GROUPS4AUTH0_AUDIENCE: The audience in the machine-to-machine token.
*/
function addClaimBasedOnRelationships(user, context, callback) {
    const fetch = require("node-fetch");
    const { URLSearchParams } = require('url');
    const jwt = require('jsonwebtoken');

    const getM2MToken = () => {
        if (global.m2mToken && global.m2mTokenExpiryInMillis > new Date().getTime() + 60000) {
            return Promise.resolve(global.m2mToken);
        } else {
            return fetch(`https://${auth0.domain}/oauth/token`, {
                method: 'POST',
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: configuration.GROUPS4AUTH0_CLIENTID,
                    client_secret: configuration.GROUPS4AUTH0_CLIENTSECRET,
                    audience: configuration.GROUPS4AUTH0_AUDIENCE,
                    scope: 'pg:tenant:admin'
                })
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then((error) => {
                            console.error("Failed to obtain m2m token");
                            throw Error(error);
                        });
                    } else {
                        return response.json();
                    }
                })
                .then(({ access_token }) => {
                    global.m2mToken = access_token;
                    global.m2mTokenExpiryInMillis = jwt.decode(access_token).exp * 1000;
                    return access_token;
                });
        }
    };

    const callPrivateGroups = (accessToken, path) => {
        const url = `${configuration.GROUPS4AUTH0_BASEURL}/${configuration.GROUPS4AUTH0_TENANT}/${path}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (response.status === 404) {
                    return [];
                } else if (!response.ok) {
                    return response.text().then((error) => {
                        console.error("Failed to call private groups v2", url);
                        throw Error(error);
                    });
                } else {
                    return response.json();
                }
            });
    };

    const getRelationships = (accessToken) => {
        return callPrivateGroups(accessToken, `actors/user/${user.user_id}/relationships`);
    };

    const addClaimToToken = (privateGroupsResponse) => {
        context.accessToken[configuration.GROUPS4AUTH0_CUSTOMCLAIM] = privateGroupsResponse.map(relationship => ({
            relationshipType: relationship.relationshipType,
            to: relationship.to
        }));
    };

    getM2MToken()
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
