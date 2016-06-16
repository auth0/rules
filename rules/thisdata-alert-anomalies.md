---
gallery: true
categories:
- webhook
---
## Send login anomaly emails

This rule is designed to detect phished or compromised accounts
and notify the user with a "was this you?" email notification.

It relies on the [ThisData](https://thisdata.com) anomaly detection
algorithms which take into account many behavioural factors including:

* Location & Velocity
* Devices
* Time of day
* Tor usage
* Risky IP addresses
* And more...

###Prerequisites
You will need a ThisData API Key. Sign up for a free ThisData
account at https://thisdata.com/sign-up

```js
function (user, context, callback) {
  // Get this from your ThisData account
  var apiKey = configuration.THISDATA_API_KEY;

  var options = {
    method: 'POST',
    headers: {
      'User-Agent': 'thisdata-auth0'
    },
    uri: 'https://api.thisdata.com/v1/events?api_key=' + apiKey,
    json: {
      verb: 'log-in',
      ip: context.request.ip,
      user_agent: context.request.userAgent,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    }
  };

  request.post(options);

  callback(null, user, context);
}
```
