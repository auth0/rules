/**
 * @title Incognia Onboarding Rule
 * @overview Verify if the device location behavior matches the address declared during onboarding.
 * @gallery true
 * @category marketplace
 *
 */
async function incogniaOnboardingRule(user, context, callback) {
  const _ = require('lodash')

  const { IncogniaAPI } = require('@incognia/api')
  const { Auth0UserUpdateUtilities } = require('@auth0/rule-utilities@0.2.0')

  const { INCOGNIA_CLIENT_ID, INCOGNIA_CLIENT_SECRET } = configuration;

  if (!INCOGNIA_CLIENT_ID || !INCOGNIA_CLIENT_SECRET) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  // For this rule to be used, please set 'incognia_onboarding_rule' as 'enabled' in your Auth0
  // application metadata. This can be done in the advanced settings of your app.
  const incogniaOnboardingRule = _.get(context, 'clientMetadata.incognia_onboarding_rule');
  if (!incogniaOnboardingRule || incogniaOnboardingRule !== 'enabled') {
    console.log('Incognia onboarding rule is not enabled for this client. Skipping');
    return callback(null, user, context);
  }

  const installationId = _.get(context, 'request.query.installation_id');
  if (!installationId) {
    console.log('Missing installation_id. Skipping.');
    return callback(null, user, context);
  }

  // User home address should be set using Auth0's Signup API for example.
  const homeAddress = _.get(user, 'user_metadata.home_address');
  if (!homeAddress) {
    console.log('Missing user home address. Skipping.');
    return callback(null, user, context);
  }

  const userUtils = new Auth0UserUpdateUtilities(user, auth0, 'incognia');

  const status = userUtils.getAppMeta('status');
  // This rule was previously run and calculated the assessment successfully.
  if (status && status !== 'pending') {
    console.log('Assessment is already calculated or is unevaluable. Skipping.');
    return callback(null, user, context);
  }

  let incogniaAPI;
  if (global.incogniaAPI) {
    incogniaAPI = global.incogniaAPI;
  } else {
    incogniaAPI = new IncogniaAPI({
      clientId: INCOGNIA_CLIENT_ID,
      clientSecret: INCOGNIA_CLIENT_SECRET
    });
    global.incogniaAPI = incogniaAPI;
  }

  let onboardingAssessment;
  const signupId = userUtils.getAppMeta('signup_id');
  // The rule was previously run, but Incognia could not assess the signup.
  if (signupId) {
    try {
      onboardingAssessment = await incogniaAPI.getOnboardingAssessment(signupId);
    } catch (error) {
      console.log('Error calling Incognia API for signup previously submitted');
      return callback(error);
    }
  // This is the first time the rule is being run with all necessary arguments.
  } else {
    try {
      onboardingAssessment = await incogniaAPI.registerOnboardingAssessment({
        installationId: installationId,
        addressLine: homeAddress
      })
    } catch (error) {
      console.log('Error calling Incognia API for new signup submission');
      return callback(error);
    }
  }

  /*
   * Updates the status in the metadata now that the assessment was calculated. If the new
   * assessment is valid, the status will go to evaluated and this rule won't be executed again.
   * If Incognia still doesn't know how to assess the signup, it will try to calculate it again up
   * to 48 hours after the first try.
   */
  const firstAssessmentAt = userUtils.getAppMeta('first_assessment_at');
  let newStatus;
  if (onboardingAssessment.riskAssessment !== 'unknown_risk') {
    newStatus = 'evaluated';
  } else if (!firstAssessmentAt) {
    newStatus = 'pending';
  } else {
    const firstAssessmentAge = Math.round(Date.now() / 1000) - firstAssessmentAt;
    // 48 hours limit.
    if (firstAssessmentAge > 172800) {
      newStatus = 'unevaluable';
    } else {
      newStatus = 'pending';
    }
  }

  const updatedMetadata = {
    status: newStatus,
    first_assessment_at: firstAssessmentAt || Math.round(Date.now() / 1000),
    signup_id: onboardingAssessment.id,
    assessment: onboardingAssessment
  }

  try {
    userUtils.setAppMeta('incognia', updatedMetadata);
    await userUtils.updateAppMeta();
  } catch (error) {
    console.log('Error calling Auth0 management API');
    return callback(error);
  }

  return callback(null, user, context);
}
