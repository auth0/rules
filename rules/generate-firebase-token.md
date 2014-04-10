## Generate a custom token for Firebase authentication

This rule is used to generate a custom authetication token for accessing Firebase. The rule
adds a new `user.firebase` property set to the user profile containing the following:

+ `user.firebase.fb_id` : a base64 encoded string based on the `user.user_id` unique property
+ `user.firebase.access_token` : the signed token that can be used to authenticate to Firebase
+ `user.firebase.expiry` : the number of seconds from epoch indicating the Date/Time the access token expires

More information is available in the Firebase API: [Custom Token Generation](https://www.firebase.com/docs/security/custom-login.html)

```js
function (user, context, callback) {

  function calcEpochTime(seconds) {
    // calculate expiry for 24 hours as number of seconds from epoch
    var currentTime = Math.floor(new Date().getTime() / 1000);
    var addSeconds = seconds || 0;
    return currentTime + addSeconds;
  }
  
  function encode(str, format) {
    var encoded = new Buffer(str, format).toString('base64');
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  
  function createToken(secret, data, issue, expiry) {
    var TOKEN_SEP = ".";
    var TOKEN_VERSION = 0;
  
    var header = {"typ":"JWT","alg":"HS256"};
    var iat = issue || calcEpochTime();
    var exp = expiry || iat + (24 * 3600);
    var claims = {"v":TOKEN_VERSION,"iat":iat,"exp":exp,"d":data};
  
    // encode headers and claims
    var encodedHeader = encode(JSON.stringify(header));
    var encodedClaims = encode(JSON.stringify(claims));
    var token = encodedHeader + TOKEN_SEP + encodedClaims;
  
    // sign the token
    var hmac = crypto.createHmac('sha256', secret).update(token);
    var hashBytes = hmac.digest('binary');
    var sig = encode(hashBytes, 'binary');
    var signedToken = encodedHeader + TOKEN_SEP + encodedClaims + TOKEN_SEP + sig;
    
    return signedToken;
  }
  
  // read the stored Firebase secret required to sign
  // the access token
  var secret = configuration.FIREBASE_SECRET;
  
  // generate a unique Firebase id by base64 encoding
  // the user profile 'user.user_id" claim
  var fb_id = new Buffer(user.user_id).toString('base64');
  
  // create the data that we want to be added to the token
  // this data is available in Firebase rules
  var data = {
    "fb_id": fb_id,
    "user_id": user.user_id,
    "name" : user.name, 
    "email": user.email
  };
  
  // generate issue and expiry date/times (seconds from epoch)
  var issue = calcEpochTime();
  var expiry = issue + (24 * 3600);
  
  // generate the signed token
  var accessToken = createToken(secret, data, issue, expiry);
  
  // add a firebase claim to the user profile
  user.firebase = {
    "fb_id": fb_id,
    "access_token": accessToken,
    "expiry": expiry
  };
  
  callback(null, user, context);
}
```