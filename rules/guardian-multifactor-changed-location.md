---
gallery: true
short_description: Trigger multifactor authentication when location changed
categories:
- multifactor
- guardian
---

## Multifactor when country changes

This rule is used to trigger multifactor authentication when the current country does not match the country of the previous session

```js
function (user, context, callback) {

  user.app_metadata = user.app_metadata || {};
  
  if(user.app_metadata.last_location !== context.request.geoip.country_code){
    context.multifactor = {
      provider: 'guardian',
      ignoreCookie: true, 
    };  
  }

  //Set the location context for next time
  user.app_metadata.last_location = context.request.geoip.country_code;
  
  callback(null, user, context);
}
```
