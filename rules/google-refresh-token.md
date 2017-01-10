---
gallery: true
short_description: Store refresh token from Google for access to Google APIs
categories:
- enrich profile
---
## Store Google Refresh Token

In some scenarios, you might want to access Google APIs from your application. You do that by using the `access_token` stored on the `identities` array (`user.identities[0].access_token`). However `access_token`s have an expiration and in order to get a new one, you have to ask the user to login again. That's why Google allows asking for a `refresh_token` that can be used forever (until the user revokes it) to obtain new `access_tokens` without requiring the user to relogin.

The way you ask for a `refresh_token` using Lock is by sending the `access_type=offline` as an extra parameter as [explained here](https://github.com/auth0/lock/wiki/Sending-authentication-parameters).

The only caveat is that Google will send you the `refresh_token` only once, and if you haven't stored it, you will have to ask for it again and add `approval_prompt=force` so the user explicitly consent again. Since this would be annoying from a user experience perspective, you should store the refresh token on Auth0 as a persistent property of the user, only if it there is a new one available.

```js
function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // IMPORTANT: for greater security, we recommend encrypting this value and decrypt on your application.
  // function encryptAesSha256 (password, textToEncrypt) {
  //   var cipher = crypto.createCipher('aes-256-cbc', password);
  //   var crypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  //   crypted += cipher.final('hex');
  //   return crypted;
  // }

  // get the google identity
  var googleIdentity = _.find(user.identities, {'provider': 'google-oauth2'});

  // if the user that just logged in has a refresh_token, persist it
  if (googleIdentity && googleIdentity.refresh_token) {
    user.app_metadata.refresh_token = googleIdentity.refresh_token;
    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        callback(null, user, context);
      })
      .catch(function(err){
        callback(err);
      });
  } else {
    callback(null, user, context);
  }
}
```
