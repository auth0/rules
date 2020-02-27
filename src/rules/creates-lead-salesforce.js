/**
 * @title Creates a new Lead in Salesforce on First Login
 * @overview On first login call the Salesforce API to record the contact as a new Lead.
 * @gallery true
 * @category webhook
 *
 * This rule will check if this is the first user login, and in that case will call Salesforce API to record the contact as a new Lead. It is using Salesforce REST APIs and the `resource owner` flow to obtain an `access_token`.
 *
 * The username you use to authenticate the API will appear as the __creator__ of the lead.
 *
 * > Note: this sample implements very basic error handling.
 *
 */

function createLeadSalesforce(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  if (user.app_metadata.recordedAsLead) {
    return callback(null,user,context);
  }

  const request = require('request');

  const MY_SLACK_WEBHOOK_URL = 'YOUR SLACK WEBHOOK URL';
  const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

  //Populate the variables below with appropriate values
  const SFCOM_CLIENT_ID = configuration.SALESFORCE_CLIENT_ID;
  const SFCOM_CLIENT_SECRET = configuration.SALESFORCE_CLIENT_SECRET;
  const USERNAME = configuration.SALESFORCE_USERNAME;
  const PASSWORD = configuration.SALESFORCE_PASSWORD;
  getAccessToken(
    SFCOM_CLIENT_ID,
    SFCOM_CLIENT_SECRET,
    USERNAME,
    PASSWORD,
    (response) => {
      if (!response.instance_url || !response.access_token) {
        slack.alert({
          channel: '#some_channel',
          text: 'Error Getting SALESFORCE Access Token',
          fields: {
            error: response
          }
        });

        return;
      }

      createLead(
        response.instance_url,
        response.access_token,
        (err, result) => {
        if (err || !result || !result.id) {
          slack.alert({
            channel: '#some_channel',
            text: 'Error Creating SALESFORCE Lead',
            fields: {
              error: err || result
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
    const data = {
      LastName: user.name,
      Company: 'Web channel signups'
    };

    request.post({
      url: url + "/services/data/v20.0/sobjects/Lead",
      headers: {
        "Authorization": "OAuth " + access_token
      },
      json: data
      }, (err, response, body) => {
        return callback(err, body);
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
      }}, (err, respose, body) => {
        return callback(JSON.parse(body));
      });
  }

  // don’t wait for the SF API call to finish, return right away (the request will continue on the sandbox)`
  callback(null, user, context);
}
