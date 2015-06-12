---
gallery: true
categories:
- access control
---

## Link Accounts with Same Email Address

This rule will link any accounts that have the same email address.

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
