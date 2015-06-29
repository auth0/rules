---
gallery: true
categories:
- enrich profile
---
## Enrich profile with FullContact

This rule gets the user profile from FullContact using the e-mail (if available). If the information is immediately available (signaled by a `statusCode=200`), it adds a new property `fullContactInfo` to the user_metadata and returns. Any other conditions are ignored. See [FullContact docs](http://www.fullcontact.com/developer/docs/) for full details.

```
function (user, context, callback) {

  var fullContactAPIKey = 'YOUR FULLCONTACT API KEY';

  if(!user.email) {
    //the profile doesn't have email so we can't query fullcontact api.
    return callback(null, user, context);
  }

  request({
    url: 'https://api.fullcontact.com/v2/person.json',
    qs: {
      email:  user.email,
      apiKey: fullContactAPIKey
    }
  }, function (e,r,b) {
    if(e) return callback(e);

    if(r.statusCode===200){
      user.user_metadata = user.user_metadata || {};
      user.user_metadata.fullContactInfo = JSON.parse(b);
      
      auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
        .then(function(){
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        });
    }
  });
}
```
