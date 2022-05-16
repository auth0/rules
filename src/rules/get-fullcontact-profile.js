/**
 *
 * This rule gets the user profile from FullContact using the e-mail (if available).
 *
 * If the information is immediately available, it adds a new property `fullcontact` to the user_metadata and returns data in the ID token. Any other conditions are ignored.
 *
 * See [FullContact docs](https://dashboard.fullcontact.com/api-ref#enrich) for full details.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `FULLCONTACT_KEY` API key found at https://dashboard.fullcontact.com/
 * 
 * @title Enrich profile with FullContact
 * @overview Get the user profile from FullContact using the email then add a new property to user_metadata.
 * @gallery true
 * @category enrich profile
 */

function getFullContactProfile(user, context, callback) {
  if (!configuration.FULLCONTACT_KEY) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const { FULLCONTACT_KEY } = configuration;

  const request = require('request');

  // skip if no email
  if (!user.email) {
    return callback(null, user, context);
  }

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
    (httpError, response, body) => {
      if (httpError) {
        console.error('Error calling FullContact API: ' + httpError.message);
        // swallow FullContact api errors and just continue login
        return callback(null, user, context);
      }

      // if we reach here, it means FullContact returned info and we'll add it to the metadata

      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        console.error(
          'Error parsing FullContact response: ' + parseError.message
        );
        return callback(null, user, context);
      }

      user.user_metadata = user.user_metadata || {};
      user.user_metadata.fullcontact = parsedBody;

      try {
        auth0.users.updateUserMetadata(user.user_id, user.user_metadata);
      } catch (auth0Error) {
        console.error('Error updating the user profile: ' + auth0Error.message);
        return callback(null, user, context);
      }

      // The details property could be very large
      const parsedBodyClone = JSON.parse(JSON.stringify(parsedBody));
      delete parsedBodyClone.details;
      context.idToken['https://example.com/fullcontact'] = parsedBodyClone;

      return callback(null, user, context);
    }
  );
}
