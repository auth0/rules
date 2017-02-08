---
gallery: true
short_description: Call the Intercom API to record/update an User
categories:
- webhook
---
## Record or update an Intercom User

This rule will call the Intercom API to create a new contact or update an existing contact's activity, whenever there is a signup or login with Auth0.

```js
function (user, context, callback) {
  var moment = require('moment-timezone');
  
  var data = {
    "user_id": user.user_id,
    "email": user.email,
    "name": user.name,
    "signed_up_at": moment(user.created_at).unix(),
    "last_seen_ip" : context.request.ip,
    "last_seen_user_agent": context.request.userAgent,
    "update_last_request_at": true,
    "new_session": true
  };
  var accessToken = 'YOUR INTERCOM ACCESS TOKEN';

  request.post({
    url: 'https://api.intercom.io/users',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json'
    },
    json: data
  });
  // don’t wait for the Intercom API call to finish, return right away.
  callback(null, user, context);
}
```
