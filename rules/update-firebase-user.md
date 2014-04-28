---
gallery: true
categories:
- webhook
---
## Update user profile identity in Firebase

This rule is used to create or update identity information for a user profile
stored in Firebase using the Firebase REST API. The unique `user.user_id` is
base64 encoded to provide a unique generated key for the user.

Each time the user logs into the system, properties of their user
profile can updated in Firebase to keep identity properties (like
name, email, etc) in sync with authentication credentials.

You can find more information in the Firebase API: [REST API](https://www.firebase.com/docs/rest-api.html)

```js
function (user, context, callback) {

  var baseURL = configuration.FIREBASE_URL;
  var secret = configuration.FIREBASE_SECRET;
  var fb_id = new Buffer(user.user_id).toString('base64');

  var fbIdentity = {
    "identity": {
      "user_id": user.user_id,
      "email": user.email,
      "name": user.name,
      "nickname": user.nickname,
      "picture": user.picture
    }
  };

  var putURL = baseURL + "/users/" + fb_id + ".json?auth=" + secret;
  request.put({
    "url": putURL,
    "json": fbIdentity
  },
  function(err, response, body) {
    if (err) return callback(err);
    return callback(null, user, context);
  });
}
```