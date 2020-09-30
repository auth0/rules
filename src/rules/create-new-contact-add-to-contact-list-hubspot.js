/**
 * @title Add New Contact to HubSpot for Marketing
 * @overview Add New Contact to HubSpot then add to a List for marketing
 * @gallery true
 * @category webhook
 *
 * This rule will add a New Contact to HubSpot if they don't already exist, and then add that Contact to a List for marketing.
 *
 * This is useful for cases where you want to enroll new users in an email list related to your application.
 * You will need to set two values HUBSPOT_API_KEY and HUBSPOT_NEW_MEMBER_LIST_ID
 * For more details about the Rules configuration settings, see here https://auth0.com/docs/rules/guides/configuration
 * For more information about Hubspot API keys see here https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key
 * Use 1 as the value for HUBSPOT_NEW_MEMBER_LIST_ID for the default list in Hubspot. Otherwise, you can see the ID of any list in HubSpot visiting it, and looking at the URL. It will have this format https://app.hubspot.com/contacts/:portalId/lists/:listId where :listId is the value you want.
 */

function createNewContactAndAddToContactListHubSpot(user, context, callback) {
  const request = require('request');
  user.app_metadata = user.app_metadata || {};

  //Populate the variables below with appropriate values
  const apiKey = configuration.HUBSPOT_API_KEY; // For more information about HubSpot API keys https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key
  const newMemberListId = configuration.HUBSPOT_NEW_MEMBER_LIST_ID; //Use 1 for default list, otherwise You can see the ID of any list in HubSpot visiting it and looking at the URL. It will have this format https://app.hubspot.com/contacts/:portalId/lists/:listId

  //************** CREATE A NEW CONTACT IN HUBSPOT **********************/
  const contactData = JSON.stringify({
    properties: [
      {
        property: 'email',
        value: user.email
      },
      {
        property: 'firstname',
        value: user.given_name || ''
      },
      {
        property: 'lastname',
        value: user.family_name || ''
      }
    ]
  });

  const contactOptions = {
    url: 'https://api.hubapi.com/contacts/v1/contact/?hapikey=' + apiKey,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: contactData
  };
  request(contactOptions, function (err, response, body) {
    if (err || (response.statusCode !== 200 && response.statusCode !== 409)) {
      console.log('NOTIFY YOUR MONITOR APPLICATION OF AN ERROR ADDING A NEW CONTACT');
      user.app_metadata.hubSpotContactCreated = false;
    } else {
      console.log('[NEW CONTACT] HANDLE ANY POSSIBLE INFORMATION YOU MIGHT WANT TO STORE IN THE USERS PROFILE');
      const newContactId = JSON.parse(body).vid;
      user.app_metadata.hubSpotContactCreated = true;
      user.app_metadata.hubSpotContactId = newContactId;

      //************** ADD NEW CONTACT TO AN EXISTING E-MAIL LIST IN HUBSPOT **********************/
      const subscribeData = JSON.stringify({ vids: [newContactId] });
      //************** NOTE THIS USES LIST NUMBER AND HUBSPOT API KEY THE URL BELOW **********************/
      const subscribeOptions = {
        url: 'https://api.hubapi.com/contacts/v1/lists/' + newMemberListId + '/add?hapikey=' + apiKey,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: subscribeData
      };

      request(subscribeOptions, function (err, response, body) {
        if (err || (response.statusCode !== 200 && response.statusCode !== 409)) {
          console.log('NOTIFY YOUR MONITOR APPLICATION OF AN ERROR ON ADDING CONTACT TO A EMAIL LIST');
          console.log(err);
          user.app_metadata.hubSpotContactAddedToList = false;
        } else {
          user.app_metadata.hubSpotContactAddedToList = true;
          console.log('[EMAIL LIST] HANDLE ANY POSSIBLE INFORMATION YOU MIGHT WANT TO STORE IN THE USERS PROFILE');
        }

        auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
      });
    }
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
  });

  return callback(null, user, context);
}
