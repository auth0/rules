---
gallery: true
short_description: This rule will add a `country` attribute to the user based on their IP address.
categories:
- enrich profile
---
## Add country to the user profile

This rule will add a `country` attribute to the user based on their ip address.

```js
function (user, context, callback) {
  if (context.request.geoip) {
    user.country = context.request.geoip.country_name;
  }
  
   // Example geoip object:
   // "geoip": {
   //    "country_code": "AR",
   //    "country_code3": "ARG",
   //    "country_name": "Argentina",
   //    "region": "05",
   //    "city": "Cordoba",
   //    "latitude": -31.41349983215332,
   //    "longitude": -64.18109893798828,
   //    "continent_code": "SA",
   //    "time_zone": "America/Argentina/Cordoba"
   //  }

  callback(null, user, context);
}
```
