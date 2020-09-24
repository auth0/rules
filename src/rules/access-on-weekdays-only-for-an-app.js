/**
 * @title Allow Access during weekdays for a specific App
 * @overview Prevent access to app during weekends.
 * @gallery true
 * @category access control
 *
 * This rule is used to prevent access during weekends for a specific app.
 *
 */

function accessOnWeekdaysOnly(user, context, callback) {

  if (context.clientName === 'TheAppToCheckAccessTo') {
    const date = new Date();
    const d = date.getDay();

    if (d === 0 || d === 6) {
      return callback(new UnauthorizedError('This app is available during the week'));
    }
  }

  callback(null, user, context);
}
