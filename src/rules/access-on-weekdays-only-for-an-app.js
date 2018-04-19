/**
 * @overview Allow Access during weekdays for a specific App 
 * @gallery true
 * @category access control
 * @description This rule is used to prevent access during weekends for a specific app.
 */

module.exports = function (user, context, callback) {

  if (context.clientName === 'TheAppToCheckAccessTo') {
    const d = Date.getDay();
    
    if (d === 0 || d === 6) {
      return callback(new UnauthorizedError('This app is available during the week'));
    }
  }

  callback(null, user, context);
}

