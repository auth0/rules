---
gallery: true
categories:
- access control
---
## Account Takeover Prevention via ThisData

This rule is designed to detect phished or compromised user accounts and block
attackers from logging in to hacked accounts. Even if the primary user
authentication is approved (e.g. correct username and password) it will deny
access if the login appears to be highly suspicious.

It uses [ThisData's](https://thisdata.com) anomaly detection
algorithms which take into account many behavioral factors including:

* Location & Velocity
* Devices
* Time of day
* Tor usage
* Risky IP addresses
* And more...

What happens if an anomaly is detected?
---------------------------------------

This rule uses ThisData's API to get a risk score for the login, and then blocks
the login by raising an `UnauthorizedError` error if the risk is very high.

Prerequisites
-------------

You will need a ThisData API Key. Sign up for a free ThisData
account at https://thisdata.com/sign-up

**Important** This rule should be used with the "Account Takeover Detection via ThisData"
Auth0 rule, which allows you to teach our algorithms about your users. Using
both rules allows you to achieve results of higher accuracy.

Learn More
----------

Read our guide "How to add login anomaly detection to Auth0"
  https://thisdata.com/blog/how-to-add-login-anomaly-detection-to-auth0/

Contact ThisData: support@thisdata.com

Auth0 Rule
----------

```js
function (user, context, callback) {
  // Get this from your ThisData account
  var apiKey = configuration.THISDATA_API_KEY;

  // 0.85 will generally block irregular Tor usage
  // or sudden changes in location and device
  var riskLimit = 0.85;

  var options = {
    method: 'POST',
    headers: {
      'User-Agent': 'thisdata-auth0'
    },
    uri: 'https://api.thisdata.com/v1/verify?api_key=' + apiKey,
    json: {
      ip: context.request.ip,
      user_agent: context.request.userAgent,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    }
  };

  request.post(options, function(e, r, b){
    if(e || r.statusCode !== 200){
      // If anything fails dont block the login
      callback(null, user, context);
    } else {

      // If the risk is high then block the login
      if(b.score >= riskLimit){
        return callback(new UnauthorizedError('Login anomaly detected by ThisData. Risk: ' + b.score));
      }

      callback(null, user, context);
    }
  });
}
```
