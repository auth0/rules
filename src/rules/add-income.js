/**
 * @overview Add income attribute based on user's IP zipcode. 
 * @gallery true
 * @category enrich profile
 * 
 * Add zipcode median household income to the user profile.
 * 
 * This rule will add an `income` (median household income) attribute to the user based on the zipcode of their ip address.
 * It is based on the last US Census data (not available for other countries).
 * 
 */

function (user, context, callback) {

  user.user_metadata = user.user_metadata || {};
  const geoip = user.user_metadata.geoip || context.request.geoip;

  if (!geoip || geoip.country_code !== 'US') return callback(null, user, context);

  if(global.incomeData === undefined) {
    retrieveIncomeData(user, geoip, context, callback);
  } else {
    setIncomeData(global.incomeData, user, geoip, context, callback);
  }

  function retrieveIncomeData(user, geoip, context, callback) {
    request.get('http://cdn.auth0.com/zip-income/householdincome.json', { json: true }, (err, resp, body) => {
      if(err) return callback(err);
      if(resp.statusCode===200) {
        global.incomeData = body;
        setIncomeData(body, user, geoip, context, callback);
      }
      callback(null, user, context);
    });
  }

  function setIncomeData(incomeData, user, geoip, context, callback) {
    if (incomeData[geoip.postal_code]) {

      user.user_metadata.zipcode_income = incomeData[geoip.postal_code];
      context.idToken['https://example.com/zipcode_income'] = incomeData[geoip.postal_code];

      auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
        .then(function(){
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        });
    }
  }
}