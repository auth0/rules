/**
 * @overview Create a Google access_token using a Service Account
 * @gallery true
 * @category enrich profile
 * 
 * Create a Google access_token using a Service Account
 * 
 * In some scenarios, you might want to access Google Admin APIs from your applications.
 * Accessing those APIs require either a consent of the Google Apps administrator or creating a
 * Service Account and obtain a token programmatically without interactive consent.
 * This rule create such token based on a service account and put it under `user.admin_access_token`. 
 * 
 * 1. Create a Service Account
 * 
 * To create a service account go to Google API Console, create a new Client ID and choose Service Account
 * 
 * <img src="https://cloudup.com/cpvhC6n9xW9+" width="420">
 * 
 * You will get the key that you would have to convert to PEM and remove the passphrase using this command
 * 
 *   openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nocerts -nodes
 * 
 * 2. Give Access to the Client on Google Apps Admin
 * 
 * Login to Google Apps Admin and go to <https://admin.google.com/AdminHome?chromeless=1#OGX:ManageOauthClients>
 * (Security -> Advanced Settings -> Manage OAuth Client Access) Enter
 * 
 * <img src="https://cloudup.com/c0Nq5NWRFaQ+" width="620">
 * 
 * Enter the Client ID created on the previous step and the scope you want to allow access to.
 * 
 * 3. Replace the values of the rule below:
 * 
 * * `KEY`: the string representation of the key (open the PEM and replace enters with \n to make it one line).
 * * `GOOGLE_CLIENT_ID_EMAIL`: this is the email address of the service account created (NOT the Client ID).
 * * `SCOPE`: the scope you want access to. Full list of scopes https://developers.google.com/admin-sdk/directory/v1/guides/authorizing.
 * * `ADMIN_EMAIL`: a user of your Google Apps domain that this rule would impersonate.
 * 
 * > NOTE: the Google access_token will last 1 hour, so you will have to either force a re-login or use a refresh token to trigger a token refresh on Auth0 and hence the rule running again.
 * > NOTE 2: you might want to be careful what scopes you ask for and where the access_token will be used. For instance, if used from a JavaScript application, a low-privilieged user might grab the token and do API calls that you wouldn't allow.
 * 
 */

function (user, context, callback) {
  
  // this is the private key you downloaded from your service account.
  // make sure you remove the password from the key and convert it to PEM using the following
  // openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nocerts -nodes
  // finally, you should put this as a configuration encrypted in Auth0
  const KEY = '....RSA private key downloaded from service account...'; 
  
  // this is the email address of the service account created (NOT the Client ID)
  const GOOGLE_CLIENT_ID_EMAIL = '.....@developer.gserviceaccount.com';
  
  // the scope you want access to. Full list of scopes https://developers.google.com/admin-sdk/directory/v1/guides/authorizing
  const SCOPE = 'https://www.googleapis.com/auth/admin.directory.user.readonly';
  
  // a user of your Google Apps domain that this rule would impersonate
  const ADMIN_EMAIL = 'foo@corp.com';
  
  const token = jwt.sign({
    scope: SCOPE,
    sub: ADMIN_EMAIL
  },
  KEY,
  { 
    audience: "https://accounts.google.com/o/oauth2/token",
    issuer: GOOGLE_CLIENT_ID_EMAIL,
    expiresInMinutes: 60,
    algorithm: 'RS256'
  });
  
  request.post({
    url: 'https://accounts.google.com/o/oauth2/token',
    form: { 
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token 
    }
  }, (err, resp, body) =>{
    if (err) return callback(null, user, context);
    const result = JSON.parse(body);
    if (result.error) {
      console.log(body);
      // log and swallow
      return callback(null, user, context);
    }
    
    context.idToken['https://example.com/admin_access_token'] = result.access_token;
    callback(null, user, context);
  });
  
}
