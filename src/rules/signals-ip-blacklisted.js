/**
 * @title Detect if IP address is in a blacklist
 * @overview Look up in Auth0 IP Signals (https://auth0.com/signals/ip) and add the name of the blacklist to the user's metadata.
 * @gallery true
 * @category access control
 *
 * This rule query to the Auth0 IP Signals API about the IP address the user 
 * connects from, whether it is blacklisted or not. If so, it will store the
 * blacklists names on user_metadata.
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
      url: 'https://signals.api.auth0.com/badip/' + context.request.ip,
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
      if ((resp.statusCode !== 200) && (resp.statusCode !== 404)) {
        console.log('Signals not returning 200 or 404:' + resp.statusCode);
        return callback(null, user, context);
      }
      let signals_response = {'response':[]};
      if (resp.statusCode === 200) {
        signals_response = JSON.parse(body);
      }
  
      if (typeof user.user_metadata.source_ip === 'undefined') {
          user.user_metadata.source_ip = {};
      }
  
      user.user_metadata.source_ip.blacklists = signals_response.response;
      user.user_metadata.source_ip.ip = context.request.ip;
    
      console.log('Signals source_ip:' + user.user_metadata.source_ip.ip + ", blacklists:" + signals_response.response);

      // persist the user_metadata update
      auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
        .then(function(){
            context.idToken['https://example.com/blacklists'] = user.user_metadata.source_ip.blacklists;
            callback(null, user, context);
        })
        .catch(function(err){
            console.log(err);
            callback(err);
        });
    });
  }