---
gallery: true
short_description: On first login call the Salesforce API to record the contact as a new Lead
categories:
- webhook
---
## Creates a new Lead in Salesforce on First Login

This rule will check if this is the first user login, and in that case will call Salesforce API to record the contact as a new Lead. It is using Salesforce REST APIs and the `resource owner` flow to obtain an `access_token`. The username you use to authenticate the API will appear as the __creator__ of the lead.

> Note: this sample implements very basic error handling.

```
function (user, context, done) {
  user.app_metadata = user.app_metadata || {};
  if (user.app_metadata.recordedAsLead) {
    return done(null,user,context);
  }

  var MY_SLACK_WEBHOOK_URL = 'YOUR SLACK WEBHOOK URL';
  var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

  //Populate the variables below with appropriate values
  var SFCOM_CLIENT_ID = configuration.SALESFORCE_CLIENT_ID;
  var SFCOM_CLIENT_SECRET = configuration.SALESFORCE_CLIENT_SECRET;
  var USERNAME = configuration.SALESFORCE_USERNAME;
  var PASSWORD = configuration.SALESFORCE_PASSWORD;

  getAccessToken(SFCOM_CLIENT_ID, SFCOM_CLIENT_SECRET, USERNAME, PASSWORD,
    function(r) {
      if (!r.instance_url || !r.access_token) {
        slack.alert({
          channel: '#some_channel',
          text: 'Error Getting SALESFORCE Access Token',
          fields: {
            error: r
          }
        });

        return;
      }

      createLead(r.instance_url, r.access_token, function (e, result) {
        if (e || !result || !result.id) {
          slack.alert({
            channel: '#some_channel',
            text: 'Error Creating SALESFORCE Lead',
            fields: {
              error: e || result
            }
          });

          return;
        }

        user.app_metadata.recordedAsLead = true;
        auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
      });
    });

  //See http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_lead.htm
  function createLead(url, access_token, callback){
    //Can use many more fields
    var data = {
      LastName: user.name,
      Company: 'Web channel signups'
    };

    request.post({
      url: url + "/services/data/v20.0/sobjects/Lead",
      headers: {
        "Authorization": "OAuth " + access_token
      },
      json: data
      }, function(e,r,b) {
        return callback(e, b);
      });
  }

  //Obtains a SFCOM access_token with user credentials
  function getAccessToken(client_id, client_secret, username, password, callback) {
    request.post({
      url: 'https://login.salesforce.com/services/oauth2/token',
      form: {
        grant_type: 'password',
        client_id: client_id,
        client_secret: client_secret,
        username: username,
        password: password
      }}, function(e,r,b) {
        return callback(JSON.parse(b));
      });
  }
  
  // don’t wait for the SF API call to finish, return right away (the request will continue on the sandbox)`
  done(null, user, context);
}
```
