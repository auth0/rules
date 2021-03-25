/* global configuration, auth0 */

/**
 * @title SecZetta Grab Risk Score
 * @overview Grab the risk score from SecZetta to use in the authentication flow
 * @gallery true
 * @category marketplace"
 * 
 * 
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `SECZETTA_API_KEY` API Token from your SecZetta tennant
 *    - `SECZETTA_BASE_URL` URL for your SecZetta tennant
 *    - `SECZETTA_ATTRIBUTE_ID` the id of the SecZetta attribute you are searching on (i.e personal_email, user_name, etc.)
 *    - `SECZETTA_PROFILE_TYPE_ID' the id of the profile type this user's profile
 *    - `SECZETTA_ALLOWABLE_RISK` Set to a risk score integer value above which MFA is required
 *    - `SECZETTA_MAXIMUM_ALLOWED_RISK` Set to a maximum risk score integer value above which login fails.
 *
 * **Optional configuration:**
 *
 *    - `SECZETTA_AUTHENTICATE_ON_ERROR` Choose whether or not the rule continues to authenticate on error
 *    - `SECZETTA_RISK_KEY` The attribute name on the account where the users risk score is stored
 *    
 * **Helpful Hints**
 *    - The SecZetta API documentation is located here: https://{{SECZETTA_BASE_URL}}/api/v1/
 *
 * @param {object} user
 * @param {object} context
 * @param {function} callback
 */
async function seczettaGrabRiskScore(user, context, callback) {
  
  if (!configuration.SECZETTA_API_KEY || !configuration.SECZETTA_BASE_URL || !configuration.SECZETTA_ATTRIBUTE_ID || !configuration.SECZETTA_PROFILE_TYPE_ID || !configuration.SECZETTA_ALLOWABLE_RISK || !configuration.SECZETTA_MAXIMUM_ALLOWED_RISK) {
    console.log("Missing required configuration. Skipping.");
    return callback(null, user, context);
  }

  const userUtils = new require(
    "@auth0/rule-utilities@0.2.0"
  );

  const axios = require("axios@0.21.1");
  const URL = require("url").URL;

  let profileResponse;
  let riskScoreResponse;

  let attributeId = configuration.SECZETTA_ATTRIBUTE_ID;
  let profileTypeId = configuration.SECZETTA_PROFILE_TYPE_ID;

  let uid = user.username || user.email; //depends on the configuration
  const profileRequestUrl = new URL('/api/advanced_search/run', configuration.SECZETTA_BASE_URL);

  let advancedSearchBody = {
    advanced_search: {
      label: "All Contractors",
      condition_rules_attributes: [
        {
          "type": "ProfileTypeRule",
          "comparison_operator": "==",
          "value": profileTypeId
        },
        {
          "type": "ProfileAttributeRule",
          "condition_object_id": attributeId,
          "object_type": "NeAttribute",
          "comparison_operator": "==",
          "value": uid
        }
      ]
    }
  };
  
  try {
    	profileResponse = await axios.post(profileRequestUrl.href,advancedSearchBody,{
        headers: {
          'Content-Type':'application/json',
          'Authorization': 'Token token='+configuration.SECZETTA_API_KEY,
          'Accept': 'application/json'
        },
      });

      //if the user isnt found via the advanced search. A 
    	if( profileResponse.data.profiles.length === 0 ) {
        console.log("Profile not found. Empty Array sent back!");
  	 		if( configuration.SECZETTA_AUTHENTICATE_ON_ERROR && configuration.SECZETTA_AUTHENTICATE_ON_ERROR === "true" ) {
          return callback(null, user, context);
        }
        return callback(new UnauthorizedError("Error retrieving Risk Score."));
  		}
    
  } catch (profileError) {
    // Swallow risk scope API call, default is set to highest risk below.
    console.log(`Error while calling Profile API: ${profileError.message}`);
    if( configuration.SECZETTA_AUTHENTICATE_ON_ERROR && configuration.SECZETTA_AUTHENTICATE_ON_ERROR === "true" ) {
      return callback(null, user, context);
    }
    return callback(new UnauthorizedError("Error retrieving Risk Score."));
  }

  //Should now have the profile in profileResponse. Lets grab it.
  let objectId = profileResponse.data.profiles[0].id;
  console.log(objectId);

  const riskScoreRequestUrl = new URL('/api/risk_scores?object_id=' + objectId, configuration.SECZETTA_BASE_URL);

  try {
      riskScoreResponse = await axios.get(riskScoreRequestUrl.href,{
      headers: {
        'Content-Type':'application/json',
        'Authorization': 'Token token='+configuration.SECZETTA_API_KEY,
        'Accept': 'application/json'
      },
    });
  } catch (riskError) {
    // Swallow risk scope API call, default is set to highest risk below.
    console.log(`Error while calling Risk Score API: ${riskError.message}`);
    if( configuration.SECZETTA_AUTHENTICATE_ON_ERROR && configuration.SECZETTA_AUTHENTICATE_ON_ERROR === "true" ) {
      return callback(null, user, context);
    }
    return callback(new UnauthorizedError("Error retrieving Risk Score."));
  }

  //Should now finally have the risk score. Lets add it to the user
  var riskScoreObj = riskScoreResponse.data.risk_scores[0];
  const overallScore = riskScoreObj.overall_score;

  // Default risk value is set to highest if API fails or no score returned.
  //var riskScore = typeof apiResponse.riskScore === "number" ? riskScore : 100;

  const allowableRisk = parseInt(configuration.SECZETTA_ALLOWABLE_RISK, 10);
  const maximumRisk = parseInt(configuration.SECZETTA_MAXIMUM_ALLOWED_RISK, 10);
  
  //if risk score is below the maxium risk score but above allowable risk: Require MFA
  if ((allowableRisk && overallScore > allowableRisk && overallScore < maximumRisk) || (allowableRisk === 0)) {
    console.log(
      `Risk score ${overallScore} is greater than maximum of ${allowableRisk}. Prompting for MFA`
    );
    context.multifactor = {
      provider: 'any',
      allowRememberBrowser: false
    };
    return callback(null, user, context);
  
  }

  //if risk score is above the maxium risk score: Fail authN
  if (maximumRisk && overallScore >= maximumRisk) {
    console.log(
      `Risk score ${overallScore} is greater than maximum of ${maximumRisk}`
    );
    return callback(new UnauthorizedError("A "+overallScore+" Risk score is too high. Maximum acceptable risk is " + maximumRisk));
  }

  if (configuration.SECZETTA_RISK_KEY) {
    context.idToken[configuration.SECZETTA_RISK_KEY] = overallScore;
    context.accessToken[configuration.SECZETTA_RISK_KEY] = overallScore;
  }

  return callback(null, user, context);
}