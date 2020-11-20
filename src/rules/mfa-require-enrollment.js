/**
 * @title Require MFA Enrollment
 * @overview Require MFA Enrollment on next login
 * @gallery true
 * @category multifactor
 *
 * This rule requires that any user not already enrolled in MFA will be presented with an enrollment prompt on their next login.
 *
 * This rule can be paired with the Adaptive MFA feature that prompts for an MFA challenge only when the login confidence is low. It can also be combined with another custom Rule that prompts for an MFA challenge under a custom condition.
 *
 * Use of the Adaptive MFA feature requires an add-on for the Enterprise plan. Please contact sales with any questions. See our [Adaptive MFA documentation](https://auth0.com/docs/mfa/adaptive-mfa) for more information.
 *
 */

function requireMfaEnrollment(user, context, callback) {
  /*
   * This rule requires that any user not already enrolled in MFA will be presented with an enrollment prompt on their
   * next login.
   *
   * This rule can be paired with the Adaptive MFA feature that prompts for an MFA challenge only when the login
   * confidence is low. It can also be combined with another custom Rule that prompts for an MFA challenge under a
   * custom condition.
   *
   * Use of the Adaptive MFA feature requires an add-on for the Enterprise plan. Please contact sales with any
   * questions. See our Adaptive MFA documentation at https://auth0.com/docs/mfa/adaptive-mfa for more information.
   */

  const enrolledFactors = user.multifactor || [];
  if (enrolledFactors.length === 0) {
    // The user has not enrolled in any MFA factor yet, trigger an MFA enrollment
    context.multifactor = {
      provider: 'any'
    };
  }

  callback(null, user, context);
}
