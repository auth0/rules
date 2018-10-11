/**
 * @title Enrich profile with Towerdata (formerly RapLeaf)
 * @overview Get user information from towerdata (formerly rapleaf) using email and add towerdata property to user profile.
 * @gallery true
 * @category enrich profile
 *
 * This rule gets user information from towerdata using the e-mail (if available).
 *
 * If the information is immediately available (signaled by a `statusCode=200`), it adds a new property `towerdata` to the user profile and returns. Any other conditions are ignored.
 *
 * See http://docs.towerdata.com/#introduction-3 for full details.
 *
 */

function (user, context, callback) {

  //Filter by app
  //if(context.clientName !== 'AN APP') return callback(null, user, context);

  if (!user.email || !user.email_verified) {
    return callback(null, user, context);
  }

  request.get('https://api.towerdata.com/v5/td', {
      qs: {
        email: user.email,
        api_key: configuration.TOWERDATA_API_KEY
      },
      json: true
    },
    (err, response, body) => {
      if (err) return callback(err);

      if (response.statusCode === 200) {
        context.idToken['https://example.com/towerdata'] = body;
      }

      return callback(null, user, context);
    });
}
