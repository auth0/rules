/**
 * @title Find the network provider, country and continent of the IP address
 * @overview Get information about the geolocation and network provider (ASN) with Auth0 IP Signals (https://auth0.com/signals/ip) and add the result to the user's metadata.
 * @gallery true
 * @category enrich profile
 *
 * This rule query to the Auth0 IP Signals API about the geolocation and network
 * provider extracted from the IP address of the user. The result is stored on 
 * the user_metadata.
 * 
 * > Note: You should sign up first in Auth0 Signals (https://auth0.com/signals)
 * and copy the API Key given into a setting key named AUTH0SIGNALS_API_KEY.
 * 
 * DISCLAIMER: Auth0 Signals is free for all and offered 'as is': there is no SLA 
 * for the service and the maximum number of daily requests is 40000
 * (https://community.auth0.com/t/how-to-obtain-an-auth0-signals-api-key/42048).
 * You can read the latest full Terms of Service here: 
 * (https://auth0.com/signals/terms-of-service)
 *
 * 
 */
function getBadIPAddressDetection(user, context, callback) {
    user.user_metadata = user.user_metadata || {};
  
    const request = require('request');
    
    console.log('Preparing request to Auth0-Signals');
    request({
      url: 'https://signals.api.auth0.com/geoip/' + context.request.ip,
      qs: {
        token:  configuration.AUTH0SIGNALS_API_KEY
      },
      headers: {
        'content-type': 'application/json'
      },
      timeout: 1000
    }, function (err, resp, body) {
      if (err) {
        console.log('Error request to Signals:' + err.code + ', ' + err);
        return callback(null, user, context);
      }
      if (resp.statusCode !== 200) {
        console.log('Signals not returning 200:' + resp.statusCode);
        return callback(null, user, context);
      }
      const signals_response = JSON.parse(body);
  
  //    "source_ip": {
  //      "country_code": "",
  //      "continent_code": "",
  //      "asn": "",
  //      "ip": "",
  //      "asn_name": ""
  //    },
      if (typeof user.user_metadata.source_ip === 'undefined') {
        user.user_metadata.source_ip = {};
      }
  
      if (typeof signals_response.ip.country !== 'undefined') {
        user.user_metadata.source_ip.country_code = signals_response.ip.country;
        user.user_metadata.source_ip.continent_code = signals_response.ip.continent;  
      }
      else {
        user.user_metadata.source_ip.country_code = '';
        user.user_metadata.source_ip.continent_code = '';  
      }
  
      if ((typeof signals_response.ip.as !== 'undefined') && (typeof signals_response.ip.as.asn !== 'undefined')) {
        user.user_metadata.source_ip.asn = signals_response.ip.as.asn;
        user.user_metadata.source_ip.asn_name = signals_response.ip.as.name;
      }
      else {
        user.user_metadata.source_ip.asn = '';
        user.user_metadata.source_ip.asn_name = '';
      }
      // persist the user_metadata update
      auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
        .then(function(){
            context.idToken['https://example.com/country_code'] = user.user_metadata.source_ip.country_code;
            context.idToken['https://example.com/continent_code'] = user.user_metadata.source_ip.continent_code;
            context.idToken['https://example.com/asn'] = user.user_metadata.source_ip.asn;
            context.idToken['https://example.com/asn_name'] = user.user_metadata.source_ip.asn_name;
            callback(null, user, context);
        })
        .catch(function(err){
            console.log(err);
            callback(err);
        });
    });
  }