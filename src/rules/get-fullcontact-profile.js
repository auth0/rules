/**
 * @title Enrich profile with FullContact
 * @overview Get the user profile from FullContact using the email then add a new property to user_metadata.
 * @gallery true
 * @category enrich profile
 *
 * This rule gets the user profile from FullContact using the e-mail (if available).
 *
 * If the information is immediately available (signaled by a `statusCode=200`), it adds a new property `fullcontact` to the user_metadata and returns. Any other conditions are ignored.
 *
 * See [FullContact docs](https://dashboard.fullcontact.com/api-ref#enrich) for full details.
 *
 */

function getFullContactProfile(user, context, callback) {
  // The following two configuration keys could be added to the Rules configuration object at https://manage.auth0.com/#/rules/
  // See https://auth0.com/docs/rules/guides/configuration for details

  // Get FullContact API key: https://dashboard.fullcontact.com/
  const FULLCONTACT_KEY = configuration.FULLCONTACT_KEY;

  const request = require('request');

  // skip if no email
  if (!user.email) return callback(null, user, context);

  // skip if FullContact metadata has already been added to the user profile
  if (user.user_metadata && user.user_metadata.fullcontact) {
    return callback(null, user, context);
  }

  request.post(
    'https://api.fullcontact.com/v3/person.enrich',
    {
      headers: {
        Authorization: 'Bearer ' + FULLCONTACT_KEY
      },
      body: JSON.stringify({
        email: user.email
      })
    },
    (error, response, body) => {
      if (error || (response && response.statusCode !== 200)) {
        // swallow FullContact api errors and just continue login
        return callback(null, user, context);
      }

      // if we reach here, it means FullContact returned info and we'll add it to the metadata

      user.user_metadata = user.user_metadata || {};
      try {
        user.user_metadata.fullcontact = JSON.parse(body);
      } catch (parseError) {
        console.error(
          'Error parsing FullContact response: ' + parseError.message
        );
        return callback(null, user, context);
      }
      user.user_metadata.fullcontact = body;

      auth0.users.updateUserMetadata(user.user_id, user.user_metadata);
      context.idToken['https://example.com/fullcontact'] =
        user.user_metadata.fullcontact;
      return callback(null, user, context);
    }
  );
}
