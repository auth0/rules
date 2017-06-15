---
gallery: false
short_description: Add Box.com access_token to the user profile
categories:
- enrich profile
---
## Add Box.com access_token to the user profile

This rule will call the box.com API to obtain a user `access_token`, and include it in the user profile object. If it is the first time a user logs in, the rule will call the Box.com API to first provision it. If provisioning is successful, it will store the `box_id` permanently in the user profile.

For more information on the Box APIs used in this rule see: https://developers.box.com/developer-edition/

> Note: these Box APIs are still in beta.

```js
function(user, context, callback) {

  var boxClientId = configuration.clientId;
  var boxClientSecret = configuration.clientSecret;
  var boxEnterpriseId = configuration.enterpriseId;
  var privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' + //TODO: REPLACE WITH YOUR OWN PRIVATE KEY
                   'MIIEpAIBAAKCAQEA0VrAkAPyX8o1/zrdMoeerq+ATEX0ZOsL+r86JRM+r8T1wrc/\n' +
                   'OupiWe5TlefCf2EjHv0YrlC6/H6fcpQm42MMGGr3lOg3CsiywJano5mD9/sRjEJ0\n' +  
                   '........\n' + 
                   '-----END RSA PRIVATE KEY-----';

  //Check if the user has already been provisioned in Box
  if(user.app_metadata.box_id){
    getBoxAccessToken(boxClientId, boxClientSecret, user.app_metadata.box_id, "user", privateKey, function(e,token){
      if(e) { 
        return callback(e,user,context);
      }

      context.idToken['https://example.com/box_access_token'] = token;
      return callback(null,user,context);
   });  
  }

  // If the user is *NOT* in Box:
  // 1. Get an "enterprise" token
  // 2. Provision the user using the /users API
  // 3. Save the ID in the box_id property for next time
  // 4. Get a Box User access_token
  
  getBoxAccessToken(boxClientId, boxClientSecret, boxEnterpriseId, "enterprise", privateKey, function(e,token){
    createUser(user, token.access_token, function(e,u){
      if(e) {
        return callback(e,user,context);
      }
      user.app_metadata.box_id = u.id; //Save property in users' metadata
      getBoxAccessToken(boxClientId, boxClientSecret, u.id, "user", privateKey, function(e,token){
        if(e) {
          return callback(e,user,context);
        }
        context.idToken['https://example.com/box_access_token'] = token;
        return callback(null,user,context); //We are done!
     });
    });
  });

  //Boilerplate code to create users/get tokens, etc
  function createUser(originalUser,access_token, done){
    request.post('https://api.box.com/2.0/users',{
        json: {
          name: originalUser.name,
          is_platform_access_only: true
        },
        headers:
        {
          Authorization: 'Bearer ' + access_token
        }
      },function(e,s,b){
          if(e) return done(e);
          done(null,b);
      });
  }

  function getBoxAccessToken(boxClientId, boxClientSecret, boxUserEnterpriseId, boxSubType, privateKey, done){
    var jwtOptions = {
      algorithm: 'RS256',
      expiresInMinutes: 1,
      issuer: boxClientId,
      audience: 'https://api.box.com/oauth2/token',
      subject: boxUserEnterpriseId
    };

    var token = {
      box_sub_type: boxSubType,
      jti: uid(16)
    };

    request.post('https://api.box.com/oauth2/token',
        {
          body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' +
                '&client_id=' + boxClientId +
                '&client_secret=' + boxClientSecret +
                '&assertion=' + jwt.sign(token, privateKey, jwtOptions)
        },
        function(e,r,b){
          if(e) return done(e);
          if(b.error) return done(b);
          done(null, JSON.parse(b));
        });
  }
     
  function uid(len) {
    var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
      buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
```
