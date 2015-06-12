---
gallery: true
categories:
- access control
---

## Link Accounts with Same Email Address

This rule will link any accounts that have the same email address. You will need to create an API token to use this rule and set a configuration value for `AUTH0_API_TOKEN`. The token you create will need the `read:users` and `update:users` scopes.

> Note: When linking accounts, only the metadata of the target user is saved. If you want to merge the metadata of the two accounts you must do that manually. See the document on [Linking Accounts](https://auth0.com/docs/link-accounts) for more details.

```js
function (user, context, callback) {
 var userApiUrl = 'https://YOUR_TENANT.auth0.com/api/v2/users';
 request({
   url: userApiUrl,
   headers: {
     Authorization: 'Bearer ' + configuration.AUTH0_API_TOKEN
   },
   qs: {
     search_engine: 'v2',
     q: 'email:"' + user.email + '" -user_id:"' + user.user_id + '"',
   }
 },
 function(err, response, body){
   if(err) return callback(err);

   var data = JSON.parse(body);

   if (data.length > 0)
   {
     for (var i = 0; i < data.length; i++) {
       var aryTmp = data[i].user_id.split('|');
       var provider = aryTmp[0];
       var targetUserId = aryTmp[1];

       request.post({
         url: userApiUrl + '/' + user.user_id + '/identities',
         headers: {
           Authorization: 'Bearer ' + configuration.AUTH0_API_TOKEN
         },
         json: { provider: provider, user_id: targetUserId }
       });
     }
   }

   return callback(null, user, context);
 });
}
```
