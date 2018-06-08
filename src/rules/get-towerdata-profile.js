/**
 * @overview Get user information from towerdata (formerly rapleaf) using email and add towerdata property to user profile
 * @gallery true
 * @category enrich profile
 * 
 * Enrich profile with Rapleaf
 * 
 * This rule gets user information from towerdata using the e-mail (if available). 
 * If the information is immediately available (signaled by a `statusCode=200`), 
 * it adds a new property `rapLeafInfo` to the user profile and returns. Any other conditions are ignored. 
 * See http://docs.towerdata.com/#introduction-3 for full details.
 * 
 */

function (user, context, callback) {

  //Filter by app
  //if(context.clientName !== 'AN APP') return callback(null, user, context);

  const towerdataApiKey = 'YOUR towerdata API KEY';

  if (!user.email) {
    return callback(null, user, context);
  }

  request.get('https://api.towerdata.com/v5/td', {
      qs: {
        email: user.email,
        api_key: towerdataApiKey
      },
      json: true
    },
    function(err, response, body) {
      if (err) return callback(err);

      if (response.statusCode === 200) {
        context.idToken['https://example.com/towerdata'] = body;
      }

      return callback(null, user, context);
    });
}
