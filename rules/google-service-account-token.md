---
gallery: true
categories:
- enrich profile
---
## Create a Google access_token using a Service Account

In some scenarios, you might want to access Google Admin APIs from your applications. Accesing those APIs require either a consent of the Google Apps administrator or creating a Service Account and obtain a token programatically without interactive consent. This rule create such token based on a service account and put it under `user.admin_access_token`. 

To create a service account go to Google API Console, create a new Client ID and choose Service Account

<img src="https://cloudup.com/cpvhC6n9xW9+" width="420">

You will get the key that you would have to convert to PEM and remove the passphrase using this command

  openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nocerts -nodes

Replace the values of the rule below:

* `KEY`: the string representation of the key (open the PEM and replace enters with \n to make it one line).
* `GOOGLE_CLIENT_ID_EMAIL`: this is the email address of the service account created (NOT the Client ID).
* `SCOPE`: the scope you want access to. Full list of scopes https://developers.google.com/admin-sdk/directory/v1/guides/authorizing.
* `ADMIN_EMAIL`: a user of your Google Apps domain that this rule would impersonate.

> NOTE: the Google access_token will last 1 hour, so you will have to either force a re-login or use a refresh token to trigger a token refresh on Auth0 and hence the rule running again.

> NOTE 2: you might want to be careful what scopes you ask for and where the access_token will be used. For instance, if used from a JavaScript application, a low-privilieged user might grab the token and do API calls that you wouldn't allow.

Here's the rule:

```js
function (user, context, callback) {
  
  // this is the private key you downloaded from your service account.
  // make sure you remove the password from the key and convert it to PEM using the following
  // openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nocerts -nodes
  // finally, you should put this as a configuration encrypted in Auth0
  var KEY = '....RSA private key downloaded from service account...'; 
  
  // this is the email address of the service account created (NOT the Client ID)
  var GOOGLE_CLIENT_ID_EMAIL = '.....@developer.gserviceaccount.com';
  
  // the scope you want access to. Full list of scopes https://developers.google.com/admin-sdk/directory/v1/guides/authorizing
  var SCOPE = 'https://www.googleapis.com/auth/admin.directory.user.readonly';
  
  // a user of your Google Apps domain that this rule would impersonate
  var ADMIN_EMAIL = 'foo@corp.com';
  
  var token = jwt.sign({ scope: SCOPE, sub: ADMIN_EMAIL }, KEY, { audience: "https://accounts.google.com/o/oauth2/token", issuer: GOOGLE_CLIENT_ID_EMAIL, expiresInMinutes: 60, algorithm: 'RS256'});
  
  request.post({ url: 'https://accounts.google.com/o/oauth2/token', form: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: token } }, function(err, resp, body) {
    if (err) return callback(null, user, context);
    var result = JSON.parse(body);
    if (result.error) {
      console.log(body);
      // log and swallow
      return callback(null, user, context);
    }
    
    user.admin_access_token = result.access_token;
    callback(null, user, context);
  });
  
}
```
