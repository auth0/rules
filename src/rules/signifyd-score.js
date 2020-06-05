/**
 * @title Detect Ecommerce Fraud Users 
 * @overview Get the signifyd score from signfyd.com and store it on app_metadata.
 * @gallery true
 * @category enrich profile
 *
 *
 * This rule gets the signifyd score and status from signifyd.com and stored it in app_metadata.
 *
 */

function getSignifydScore(user, context, callback) {
  
    user.app_metadata = user.app_metadata || {};
    if (!user.app_metadata.caseId) return callback(null, user, context);
  
    if(!user.email) {
      // the profile doesn't have email so we can't query their api.
      return callback(null, user, context);
    }
  
    const request = require('request');
  
    request({
      url: `https://api.signifyd.com/v2/cases/${user.app_metadata.caseId}`,
      headers: {
          "Authorization": "Basic YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo6"
        }
    
    }, function (err, resp, body) {
      if (err) return callback(null, user, context);
      if (resp.statusCode !== 200) return callback(null, user, context);
      const signifyd = JSON.parse(body);
      if (signifyd.status !== 'Ok') return callback(null, user, context);
  
      user.app_metadata = user.app_metadata || {};
      user.app_metadata.guaranteeEligible = signifyd.data.status;
      user.app_metadata.signifyd = signifyd.data.score;
      // "attributes":[
      //      "guaranteeEligible":true,
      //      "status": "open",
      //      "caseId": caseId. 
      //      "score": 785, (A value from 0-1000 indicating the likelihood that the order/transaction is fraud. 0 indicates the highest risk, 1000 inidicates the lowest risk)
      //      "uuid": 97c56c86-7984-44fa-9a3e-7d5f34d1bead
      //      "headline": Maxine Trycia
      //      "orderId": 19418
      //      "orderAmount": 48
      //      "associatedTeam": 1
      // ]
      user.app_metadata.signifyd_details = signifyd.data.details;
  
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function(){
          context.idToken['https://example.com/signifyd_status'] = user.app_metadata.signifyd_status;
          context.idToken['https://example.com/signifyd_score'] = user.app_metadata.signifyd_score;
          callback(null, user, context);
        })
        .catch(function(err){
          callback(null, user, context);
        });
    });
  }