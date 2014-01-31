## Get RapLeaf user info based on User email and add it to user profile

This rule gets user information from RapLeaf using the e-mail (if available). If the information is immediately available (signaled by a `statusCode=200`), it adds a new property `rapLeafInfo` to the user profile and returns. Any other conditions are ignored. See [RapLeaf docs](http://www.rapleaf.com/developers/personalization-api/) for full details.

```
function (user, context, callback) {
  
  var rapLeafAPIKey = 'YOUR RAPLEAF API KEY';
  
  if(user.email){
    request('https://personalize.rapleaf.com/v4/dr?email=' + 
            encodeURIComponent(user.email) + 
            '&api_key=' + rapLeafAPIKey, 
            function(e,r,b){  
              console.log(r.statusCode);
              if(e) return callback(e);
              
              if(r.statusCode===200){
               user.rapLeafData = JSON.parse(b);
              }
              
              return callback(null,user,context);
            });
  }else{
    return callback(null,user,context);
  }
}
```
