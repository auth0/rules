---
gallery: true
short_description: Trigger multifactor authentication when the user changes devices.
categories:
- multifactor
- guardian
---

## Multifactor with Auth0 Guardian

This rule is used to trigger multifactor authentication when the user has changed devices since the last request.

```js
function (user, context, callback) {

  user.app_metadata = user.app_metadata || {}; 
  var currentFingerprint = clientFingerprint();

  if(user.app_metadata.previous_fingerprint !== currentFingerprint){
    context.multifactor = {
      provider: 'guardian',
      ignoreCookie: true, 
    };  
  }
  
  //Computes user device fingerprint with userAgent + IP address
  function clientFingerprint()
  {
    var shasum = crypto.createHash('sha1');
    shasum.update(context.request.userAgent);
    shasum.update(context.request.ip);
    return shasum.digest('hex');
  }

  //Set the device context for next time
  user.app_metadata.previous_fingerprint = currentFingerprint;
  
  callback(null, user, context);
}
```
