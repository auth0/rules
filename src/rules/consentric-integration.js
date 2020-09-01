/**
* @title Progressive Consent Capture
* @overview Uses a widget to capture missing consents and preferences at login to boost engagement and support compliance
* @gallery true
* @category marketplace
* 
* Consentric provides an integration to extend Auth0's universal login to include collection of consent as part of the authentication and sign up flows.
*
*/

function consentric(user, context, callback) {
    const axios = require('axios');
    const moment = require('moment');


    const asMilliSeconds = (seconds) => seconds * 1000;


    const initConsentricFlow = async () => {

        // Returns Consentric API JWT from either cache or retrieves new
        const getConsentricApiAccessToken = async (configuration, global) => {

            if ((!global.consentricApiToken) || global.consentricApiToken.expires < new Date().getTime()) {

                const {
                    CONSENTRIC_AUTH_HOST,
                    CONSENTRIC_AUDIENCE,
                    CONSENTRIC_CLIENT_ID,
                    CONSENTRIC_CLIENT_SECRET,
                    CONSENTRIC_APPLICATION_ID
                } = configuration;

                const instance = axios.create({
                    baseURL: CONSENTRIC_AUTH_HOST,
                    timeout: 1000,
                });


                const resp = await instance
                    .post('/oauth/token', {
                        grant_type: 'client_credentials',
                        client_id: CONSENTRIC_CLIENT_ID,
                        client_secret: CONSENTRIC_CLIENT_SECRET,
                        audience: CONSENTRIC_AUDIENCE,
                        applicationId: CONSENTRIC_APPLICATION_ID,
                    })
                    .then(response => {
                        return response.data;
                    })
                    .catch(err => console.log(err));

                const expiryInMS = new Date().getTime() + asMilliSeconds(resp.expires_in);

                const auth = {
                    jwt: resp.access_token,
                    exp: expiryInMS
                };


                global.consentricApiToken = auth;

                console.log(`Generated Api Token: [${auth.jwt.substring(0, 10)}...] expires [${auth.exp}]`);

                return auth;
            }

            return global.consentricApiToken;
        };


        //Creates Citizen Record in Consentric with Auth0 Id
        const createCitizen = async ({ userRef, apiAccessToken, configuration }) => {
            try {
                console.log(`Upserting Consentric Citizen record for ${userRef}`);

                const { CONSENTRIC_APPLICATION_ID, CONSENTRIC_API_HOST } = configuration;
                const instance = axios.create({
                    baseURL: CONSENTRIC_API_HOST,
                    headers: {
                        Authorization: 'Bearer ' + apiAccessToken
                    },
                    timeout: 1000,
                });


                return await instance
                    .post('/v1/citizens',
                        {
                            applicationId: CONSENTRIC_APPLICATION_ID,
                            externalRef: userRef,
                        })
                    .then(({ data }) => {
                        return {
                            citizenId: data.citizenId,
                            externalRef: data.externalRef
                        };
                    })
                    .catch(err => {
                        if (err.response.status !== 409) {
                            console.error(err);
                        }
                    });
            } catch (err) {
                console.log(err);
            }
        };


        // Retrieves Consentric User Token from User Metadata
        const getConsentricUserTokenFromMetadata = user =>
            user.app_metadata && user.app_metadata.consentric;

        // Generates On Demand Consentric User Token for given User with API Access Token
        const generateConsentricUserAccessToken = async ({ userRef, apiAccessToken, configuration }) => {
            try {
                const { CONSENTRIC_APPLICATION_ID, CONSENTRIC_API_HOST } = configuration;

                console.log(`Attempting to call API for ${userRef} with jwt [${apiAccessToken.substring(0, 10)}]`);
                const instance = axios.create({
                    baseURL: CONSENTRIC_API_HOST,
                    headers: {
                        Authorization: 'Bearer ' + apiAccessToken
                    },
                    timeout: 1000,
                });


                return await instance
                    .post('/v1/access-tokens/tokens',
                        {
                            applicationId: CONSENTRIC_APPLICATION_ID,
                            externalRef: userRef,
                            expiryDate: moment().add(3, 'months').toISOString()
                        })
                    .then(({ data }) => {
                        return {
                            token: data.token,
                            exp: data.expiryDate
                        };
                    })
                    .catch(err => console.error(err));

            } catch (err) {
                console.error(err);
            }
        };


        const loadConsentricUserAccessToken = async ({ user, configuration, global }) => {

            const metadataUserToken = await getConsentricUserTokenFromMetadata(user);

            if ((!metadataUserToken) || moment(metadataUserToken.expires).isBefore(moment())) {
                const apiAccessToken = await getConsentricApiAccessToken(configuration, global);
                const delimIdx = user.user_id.indexOf('|');
                const userRef = user.user_id.substring(delimIdx + 1);

                await createCitizen(
                    {
                        userRef,
                        apiAccessToken: apiAccessToken.jwt,
                        configuration
                    });

                const generatedToken = await generateConsentricUserAccessToken(
                    {
                        userRef,
                        apiAccessToken: apiAccessToken.jwt,
                        configuration,
                        global,
                    },
                );

                // persist the app_metadata update
                try {
                    await auth0.users.updateAppMetadata(user.user_id, { ...user.app_metadata, consentric: generatedToken });
                } catch (err) {
                    console.error(`Issue Updating Auth0 app_metadata for user ${user.user_id} - ${err}`);
                }

                return generatedToken;
            }

            return metadataUserToken;


        };


        const consentricUserAccessToken = await loadConsentricUserAccessToken({ user, configuration, global });


        const urlConnector = configuration.CONSENTRIC_REDIRECT_URL.includes('?') ? '&' : '?';
        const redirectUrl = configuration.CONSENTRIC_REDIRECT_URL + urlConnector + 'token=' + consentricUserAccessToken.token;


        context.redirect = {
            url: redirectUrl
        };


        return callback(null, user, context);
    };


    if (context.protocol !== "redirect-callback") {
        return initConsentricFlow();
    } else {
        // Run after Redirect
        return callback(null, user, context);
    }
}