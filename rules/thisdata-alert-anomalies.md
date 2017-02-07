---
gallery: true
categories:
- webhook
---
## Account Takeover Detection via ThisData

This rule is designed to detect phished or compromised user accounts, and
optionally send an email or SMS notification to the user asking
"Was This You?". This is similar to the emails you get signing in to Google or
Facebook from a new device or location.
The users' response can be used to take further action, like shutting
down a compromised account.

It uses [ThisData's](https://thisdata.com) anomaly detection
algorithms which take into account many behavioral factors including:

* Location & Velocity
* Devices
* Time of day
* Tor usage
* Risky IP addresses
* And more...

This rule works in the background, and will never stop your users from logging
in to your application. Use our "Account Takeover Prevention via ThisData" Auth0
rule to stop suspicious log-ins in their tracks.

Prerequisites
-------------

You will need a ThisData API Key. Sign up for a free ThisData
account at https://thisdata.com/sign-up

Configuration
-------------

Notifications are disabled by default - you have full control over how we
contact your users. Visit ThisData.com to configure:

  - Sending "Was This You" notifications via email or SMS (text message)
  - Slack notifications
  - webhooks to your app

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
