/**
 * @title Vouched Verification
 * @overview Verify a person's identity using Vouched.
 * @gallery true
 * @category marketplace
 *
 * Please see the [Vouched integration](https://marketplace.auth0.com/integrations/vouched-id-verification) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `VOUCHED_API_KEY` Your Private Key located in Vouched Dashboard
 *    - `VOUCHED_PUBLIC_KEY` Your Public Key located in Vouched Dashboard
 *
 * **Optional configuration:**
 *
 *    - `VOUCHED_API_URL` Your Vouched API URL; leave blank unless instructed by your Vouched rep
 *    - `VOUCHED_ID_TOKEN_CLAIM` Set a `https://vouchedid/is_verified` claim in the ID token with results
 *    - `VOUCHED_VERIFICATION_OPTIONAL` Set to "true" to succeed even if verification fails
 */

async function vouchedVerification(user, context, callback) {
  if (!configuration.VOUCHED_API_KEY || !configuration.VOUCHED_PUBLIC_KEY) {
    console.log("Missing required configuration. Skipping.");
    return callback(null, user, context);
  }

  /* ----------- START helpers ----------- */
  const axios = require("axios");
  const url = require("url");
  const { Auth0RedirectRuleUtilities } = require("@auth0/rule-utilities@0.1.0");

  const ruleUtils = new Auth0RedirectRuleUtilities(user, context, configuration);

  const defaultApiUrl = "https://verify.vouched.id/api";
  const defaultUiUrl = "https://i.vouched.id";
  const idTokenClaim = "https://vouched.id/is_verified";

  const getJob = async (apiKey, jobToken, apiUrl) => {
    const response = await axios({
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      baseURL: apiUrl,
      url: "/jobs",
      params: {
        token: jobToken
      }
    });
    const items = response.data.items;
    if (items.length === 0) {
      throw new Error(`Unable to find Job with the following id: ${jobToken}`);
    }
    return items[0];
  };

  const createPacket = async (apiKey, publicKey, continueUrl, user, apiUrl = defaultApiUrl) => {
    const requestBody = {
      pk: publicKey,
      uid: user.user_id,
      continueUrl
    };

    if (user.given_name) requestBody.firstName = user.given_name;

    if (user.family_name) requestBody.lastName = user.family_name;

    const response = await axios({
      method: "post",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      baseURL: apiUrl,
      url: "/packet/auth0",
      data: requestBody
    });
    const data = response.data;
    if (data.errors) {
      throw new Error(`${data.errors[0].message}`);
    }
    return data.id;
  };

  const isJobForUser = (job, userId) => {
    try {
      return job.request.properties.filter((prop) => prop.name === "uid" && prop.value === userId).length === 1;
    } catch (e) {
      return false;
    }
  };

  const extractResults = (job) => {
    const { id, status, reviewSuccess, result } = job;
    return {
      id,
      status,
      reviewSuccess,
      result
    };
  };

  const isJobVerified = (job) => {
    try {
      return job.result.success || job.reviewSuccess;
    } catch (e) {
      return false;
    }
  };

  const redirectToVerification = (packetId, baseUrl = defaultUiUrl) => {
    const redirectUrl = new url.URL(`${baseUrl}/auth0`);
    redirectUrl.searchParams.append("id", packetId);
    return redirectUrl.href;
  };

  /* ----------- END helpers ----------- */

  user.app_metadata = user.app_metadata || {};
  const vouchedApiUrl = configuration.VOUCHED_API_URL || defaultApiUrl;

  try {
    const jobToken = ruleUtils.queryParams.jobToken;
    if (ruleUtils.isRedirectCallback && jobToken) {
      // get job from API
      const job = await getJob(configuration.VOUCHED_API_KEY, jobToken, vouchedApiUrl);

      // check if job's user is the same as current user
      if (!isJobForUser(job, user.user_id)) {
        return callback(new Error(`The ID Verification results do not belong to this user.`));
      }

      // update app metadata w/ results
      user.app_metadata.vouched = extractResults(job);
      await auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
    }

    const vouchedResults = user.app_metadata.vouched;
    if (vouchedResults) {
      if (!isJobVerified(vouchedResults)) {
        // user failed id verification
        const mostRecentJob = await getJob(configuration.VOUCHED_API_KEY, jobToken, vouchedApiUrl);

        // check if job's user is the same as current user
        if (!isJobForUser(mostRecentJob, user.user_id)) {
          return callback(new Error(`The ID Verification results do not belong to this user.`));
        }

        // user is now verified, update app metadata
        if (isJobVerified(mostRecentJob)) {
          user.app_metadata.vouched = extractResults(mostRecentJob);
          await auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
        } else {
          // user failed verification check and doesn't have an override
          if (configuration.VOUCHED_ID_TOKEN_CLAIM === "true") {
            context.idToken[idTokenClaim] = false;
          }
          if (configuration.VOUCHED_VERIFICATION_OPTIONAL === "true") {
            return callback(null, user, context);
          }

          return callback(new Error(`This user's ID cannot be verified.`));
        }
      }
    } else {
      // create Auth0 packet to securely pass info to Vouched
      const packetId = await createPacket(
        configuration.VOUCHED_API_KEY,
        configuration.VOUCHED_PUBLIC_KEY,
        `https://${context.request.hostname}/continue`,
        user
      );

      // user doesn't have a verification result, redirect to Vouched with packet
      if (ruleUtils.canRedirect) {
        context.redirect = { url: redirectToVerification(packetId) };
      }
      return callback(null, user, context);
    }
  } catch (e) {
    return callback(e);
  }

  if (configuration.VOUCHED_ID_TOKEN_CLAIM === "true") {
    context.idToken[idTokenClaim] = true;
  }

  return callback(null, user, context);
}
