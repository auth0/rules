---
gallery: true
categories:
- enrich profile
---
## Enrich profile with the locations where the user logs in

This rule gets the user locations based on the IP and is added to the app_metadata in the `geoip` attribute.

```
function (user, context, callback) {
  
  user.app_metadata = user.app_metadata || {};
  
  user.app_metadata.geoip = context.request.geoip;
  
  auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(function(){
      callback(null, user, context);
    })
    .catch(function(err){
      callback(err);
    });
}
```
