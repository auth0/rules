/**
 * @title SecZetta Get Risk Score
 * @overview Grab the risk score from SecZetta to use in the authentication flow
 * @gallery false
 * @category marketplace
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SECZETTA_API_KEY` API Token from your SecZetta tennant
 *    - `SECZETTA_BASE_URL` URL for your SecZetta tennant
 *    - `SECZETTA_ATTRIBUTE_ID` the id of the SecZetta attribute you are searching on (i.e personal_email, user_name, etc.)
 *    - `SECZETTA_PROFILE_TYPE_ID` the id of the profile type this user's profile
 *    - `SECZETTA_ALLOWABLE_RISK` Set to a risk score integer value above which MFA is required
 *    - `SECZETTA_MAXIMUM_ALLOWED_RISK` Set to a maximum risk score integer value above which login fails.
 *
 * **Optional configuration:**
 *
 *    - `SECZETTA_AUTHENTICATE_ON_ERROR` Choose whether or not the rule continues to authenticate on error
 *    - `SECZETTA_RISK_KEY` The attribute name on the account where the users risk score is stored
 *
 * **Helpful Hints**
 *
 *    - The SecZetta API documentation is located here: `https://{{SECZETTA_BASE_URL}}/api/v1/`
 */
async function seczettaGrabRiskScore(user, context, callback) {
  if (
    !configuration.SECZETTA_API_KEY ||
    !configuration.SECZETTA_BASE_URL ||
    !configuration.SECZETTA_ATTRIBUTE_ID ||
    !configuration.SECZETTA_PROFILE_TYPE_ID ||
    !configuration.SECZETTA_ALLOWABLE_RISK ||
    !configuration.SECZETTA_MAXIMUM_ALLOWED_RISK
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const axios = require('axios@0.21.1');
  const URL = require('url').URL;

  let profileResponse;
  let riskScoreResponse;

  const attributeId = configuration.SECZETTA_ATTRIBUTE_ID;
  const profileTypeId = configuration.SECZETTA_PROFILE_TYPE_ID;
  const allowAuthOnError =
    configuration.SECZETTA_AUTHENTICATE_ON_ERROR === 'true';

  // Depends on the configuration
  const uid = user.username || user.email;

  const profileRequestUrl = new URL(
    '/api/advanced_search/run',
    configuration.SECZETTA_BASE_URL
  );

  const advancedSearchBody = {
    advanced_search: {
      label: 'All Contractors',
      condition_rules_attributes: [
        {
          type: 'ProfileTypeRule',
          comparison_operator: '==',
          value: profileTypeId
        },
        {
          type: 'ProfileAttributeRule',
          condition_object_id: attributeId,
          object_type: 'NeAttribute',
          comparison_operator: '==',
          value: uid
        }
      ]
    }
  };

  try {
    profileResponse = await axios.post(
      profileRequestUrl.href,
      advancedSearchBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token token=' + configuration.SECZETTA_API_KEY,
          Accept: 'application/json'
        }
      }
    );

    // If the user is not found via the advanced search
    if (profileResponse.data.profiles.length === 0) {
      console.log('Profile not found. Empty Array sent back!');
      if (allowAuthOnError) {
        return callback(null, user, context);
      }
      return callback(
        new UnauthorizedError('Error retrieving SecZetta Risk Score.')
      );
    }
  } catch (profileError) {
    console.log(
      `Error while calling SecZetta Profile API: ${profileError.message}`
    );

    if (allowAuthOnError) {
      return callback(null, user, context);
    }

    return callback(
      new UnauthorizedError('Error retrieving SecZetta Risk Score.')
    );
  }

  // Should now have the profile in profileResponse. Lets grab it.
  const objectId = profileResponse.data.profiles[0].id;

  const riskScoreRequestUrl = new URL(
    '/api/risk_scores?object_id=' + objectId,
    configuration.SECZETTA_BASE_URL
  );

  try {
    riskScoreResponse = await axios.get(riskScoreRequestUrl.href, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token token=' + configuration.SECZETTA_API_KEY,
        Accept: 'application/json'
      }
    });
  } catch (riskError) {
    console.log(
      `Error while calling SecZetta Risk Score API: ${riskError.message}`
    );

    if (allowAuthOnError) {
      return callback(null, user, context);
    }

    return callback(
      new UnauthorizedError('Error retrieving SecZetta Risk Score.')
    );
  }

  // Should now finally have the risk score. Lets add it to the user
  const riskScoreObj = riskScoreResponse.data.risk_scores[0];
  const overallScore = riskScoreObj.overall_score;

  const allowableRisk = parseInt(configuration.SECZETTA_ALLOWABLE_RISK, 10);
  const maximumRisk = parseInt(configuration.SECZETTA_MAXIMUM_ALLOWED_RISK, 10);

  // If risk score is below the maxium risk score but above allowable risk: Require MFA
  if (
    (allowableRisk &&
      overallScore > allowableRisk &&
      overallScore < maximumRisk) ||
    allowableRisk === 0
  ) {
    console.log(
      `Risk score ${overallScore} is greater than maximum of ${allowableRisk}. Prompting for MFA.`
    );
    context.multifactor = {
      provider: 'any',
      allowRememberBrowser: false
    };
    return callback(null, user, context);
  }

  // If risk score is above the maxium risk score: Fail authN
  if (maximumRisk && overallScore >= maximumRisk) {
    console.log(
      `Risk score ${overallScore} is greater than maximum of ${maximumRisk}`
    );
    return callback(
      new UnauthorizedError(
        `A ${overallScore} risk score is too high. Maximum acceptable risk is ${maximumRisk}.`
      )
    );
  }

  if (configuration.SECZETTA_RISK_KEY) {
    context.idToken[configuration.SECZETTA_RISK_KEY] = overallScore;
    context.accessToken[configuration.SECZETTA_RISK_KEY] = overallScore;
  }

  return callback(null, user, context);
}
