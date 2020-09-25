/**
 * @title Multifactor Stepup Authentication
 * @overview Used to challenge for a second factor when requested by sending acr_values.
 * @gallery true
 * @category multifactor
 *
 * This rule will challenge for a second authentication factor on request (step up) when
 * acr_values = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor' is sent in
 * the request. Before the challenge is made, 'context.authentication.methods' is checked
 * to determine when the user has already successfully completed a challenge in the
 * current session.
 *
 */

function (user, context, callback) {

  // This rule initiates multi-factor authenticaiton as a second factor
  // whenever the request contains the following value:
  // 
  // acr_values = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor'
  // 
  // and multi-factor authentication has not already been completed in the
  // current session/
  
  if (context.request.query.acr_values === 'http://schemas.openid.net/pape/policies/2007/06/multi-factor' && !context.authentication.methods.some(method => method.name === 'mfa')) {
  
  	context.multifactor = {
        provider: 'any',
        allowRememberBrowser: false,
      };
    }

  callback(null, user, context);
}
