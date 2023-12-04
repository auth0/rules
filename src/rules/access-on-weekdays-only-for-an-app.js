/**
 * This rule is used to prevent access during weekends for a specific app.
 *
 * @title Allow Access during weekdays for a specific App
 * @overview Prevent access to app during weekends.
 * @gallery true
 * @category access control
 */

function accessOnWeekdaysOnly(user, context, callback) {
  if (context.clientName === 'TheAppToCheckAccessTo') {
    // Get the current day in US Central Time
    const day = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'long'});

    // Don't allow access on the weekend
    if (!['Saturday', 'Sunday'].includes(day)) {
      return callback(
        new UnauthorizedError('This app is available during the week')
      );
    }
  }

  callback(null, user, context);
}
