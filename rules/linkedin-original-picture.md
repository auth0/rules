---
gallery: true
categories:
- enrich profile
---
## Use the original sized profile picture for LinkedIn connections

This rule will set the `picture` to the original sized profile picture for users who login with LinkedIn.

```js
function (user, context, callback) {
  if (context.connection !== 'linkedin') {
    callback(null, user, context);
  }
  
  var request = require('request');
  var options = {
    url: 'https://api.linkedin.com/v1/people/~/picture-urls::(original)?format=json',
    headers: {
      Authorization: 'Bearer ' + user.identities[0].access_token
    }
  };

  request(options, function(error, response) {
    if (!error && response.statusCode === 200) {
      var json = JSON.parse(response.body);
      if (json.values && json.values.length >= 1) {
        user.picture = json.values[0];
      }
    }
    callback(null, user, context);
  });
}
```
