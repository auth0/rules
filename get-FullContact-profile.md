## Get a FullContact Profile based on User email

This rule gets the user profile from FullContact using the e-mail (if available). If the information is immediately available (signaled by a `statusCode=200`), it adds a new property `fullContactInfo` to the user profile and returns. Any other conditions are ignored. See [FullContact docs](http://www.fullcontact.com/developer/docs/) for full details.

```
function (user, context, callback) {
  
  var fullContactAPIKey = 'YOUR FULLCONTACT API KEY';
  
  if(user.email){
    request('https://api.fullcontact.com/v2/person.json?email=' + user.email + '&apiKey=' + fullContactAPIKey,
            function(e,r,b){
              if(e) return callback(e);
              if(r.statusCode===200){
                user.fullContactInfo = JSON.parse(b);
              }
              return callback(null, user, context);
            });
  }
  else{
    return callback(null, user, context);
  }
}
```
