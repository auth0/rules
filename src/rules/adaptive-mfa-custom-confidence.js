/**
 * @title Adaptive MFA with Custom Confidence
 * @overview Trigger multifactor authentication for a specific risk assessment result.
 * @gallery true
 * @category multifactor
 *
 * This rule is used to trigger multifactor authentication when a specific risk assessment result is detected.
 *
 * The `context.riskAssessment` attribute will be available only when the Adaptive MFA policy is enabled for your tenant. This feature is only available to customers that have subscribed to an Enterprise plan.
 *
 * For more information about Adaptive MFA and the `context.riskAssessment` attribute, read our [full documentation](https://auth0.com/docs/<<<TODO>>>).
 *
 */

function adaptiveMfaWithCustomConfidence(user, context, callback) {
  const riskAssessment = context.riskAssessment;

  // Example condition: prompt MFA only based on the ImpossibleTravel confidence level.
  let shouldPromptMfa;
  switch (riskAssessment.assessments.ImpossibleTravel.confidence) {
    case 'low':
    case 'medium':
      shouldPromptMfa = true;
      break;
    case 'high':
      shouldPromptMfa = false;
      break;
    case 'neutral':
      // When this assessor has no useful information about the confidence, do not prompt MFA.
      shouldPromptMfa = false;
      break;
  }

  // It only makes sense to prompt for MFA when the user has at least one enrolled MFA factor.
  const userEnrolledFactors = user.multifactor || [];
  const canPromptMfa = userEnrolledFactors.length > 0;

  if (shouldPromptMfa && canPromptMfa) {
    context.multifactor = {
      provider: 'any',
      // ensure that we will prompt MFA, even if the end-user has selected to remember the browser.
      allowRememberBrowser: false
    };
  }

  callback(null, user, context);
}
