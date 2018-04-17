---
short_description: Send the user's IP address, user_agent, email address and username in MD5 to MaxMind's MinFraud API
---
# Fraud Prevention

This rule will send the user's IP address, user_agent, email address (in MD5) and username (in MD5) to MaxMind's MinFraud API. This API will return information about this current transaction like the location, a risk score, ...

For example:

```
{ key: 'distance',
  value: '0',
  countryMatch: '',
  countryCode: 'US',
  freeMail: 'No',
  anonymousProxy: 'No',
  binMatch: 'NA',
  binCountry: '',
  err: 'CITY_REQUIRED',
  proxyScore: '0.00',
  ip_region: 'NY',
  ip_city: 'Jamaica',
  ip_latitude: '40.6915',
  ip_longitude: '-73.8057',
  binName: '',
  ip_isp: 'Amateur Radio Digital Communications',
  ip_org: 'Amateur Radio Digital Communications',
  binNameMatch: 'NA',
  binPhoneMatch: 'NA',
  binPhone: '',
  custPhoneInBillingLoc: '',
  highRiskCountry: 'No',
  queriesRemaining: '1085',
  cityPostalMatch: '',
  shipCityPostalMatch: '',
  maxmindID: '2G9VOIA7',
  ip_asnum: 'AS7377 University of California at San Diego',
  ip_userType: 'residential',
  ip_countryConf: '99',
  ip_regionConf: '61',
  ip_cityConf: '61',
  ip_postalCode: '11402',
  ip_postalConf: '10',
  ip_accuracyRadius: '999',
  ip_netSpeedCell: 'Corporate',
  ip_metroCode: '501',
  ip_areaCode: '718',
  ip_timeZone: 'America/New_York',
  ip_regionName: 'New York',
  ip_domain: '',
  ip_countryName: 'United States',
  ip_continentCode: 'NA',
  ip_corporateProxy: 'No',
  riskScore: '0.10',
  prepaid: '',
  minfraud_version: '1.3',
  service_level: 'premium' }
```

We can leverage this information from within a rule to block logins with high fraud risk:

```js
function (user, context, callback) {
  const querystring = require('querystring');
  const request = require('request');
  const crypto = require('crypto');

  const MINFRAUD_API = 'https://minfraud.maxmind.com/app/ccv2r';

  const data = {
    i: context.request.ip,
    user_agent: context.request.userAgent,
    license_key: 'YOUR_LICENSE_KEY',
    emailMD5: user.email &&
        crypto.createHash('md5').update(user.email).digest("hex") || null,
    usernameMD5: user.username &&
        crypto.createHash('md5').update(user.username).digest("hex") || null
  };

  request.post(MINFRAUD_API, { form: data, timeout: 3000 }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      const result = querystring.parse(body, ';');

      console.log(`Fraud response: ${JSON.stringify(result, null, 2)}`);

      if (result.riskScore && (result.riskScore * 100) > 20) {
        return callback(new UnauthorizedError('Fraud prevention!'));
      }
    }

    if (err) {
      console.log(`Error while attempting fraud check: ${err.message}`);
    }
    if (res.statusCode !== 200) {
      const message = err && err.message;
      console.log(`Unexpected error while attempting fraud check: ${message}`);
    }

    // If the service is down, the request failed, or the result is OK just continue.
    return callback(null, user, context);
  });
}
```

> Note: You will need to sign up here to get a license key https://www.maxmind.com/
