/**
 * @overview Set the picture to the profile picture for users who login with LinkedIn
 * @gallery true
 * @category enrich profile
 *
 * Use the original sized profile picture for LinkedIn connections
 * This rule will set the `picture` to the original sized profile picture for users who login with LinkedIn.
 */

function (user, context, callback) {
  if (context.connection !== 'linkedin') {
    return callback(null, user, context);
  }

  const request = require('request');

  const liIdentity = _.find(user.identities, { connection: 'linkedin' });

  const options = {
    url: 'https://api.linkedin.com/v1/people/~/picture-urls::(original)?format=json',
    headers: {
      Authorization: 'Bearer ' + liIdentity.access_token
    }
  };

  request(options, function(error, response) {
    if (!error && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      if (json.values && json.values.length >= 1) {
        context.idToken.picture = json.values[0];
      }
    }

    return callback(null, user, context);
  });
}
