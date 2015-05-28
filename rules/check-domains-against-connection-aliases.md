---
gallery: true
categories:
- access control
---
## Check user email domain matches domains configured in connection

This rule will check that the email the user has used to login matches any of the domains configured in a connection. If there are no domains configured, it will allow access.

> Note: this rule uses Auth0 API v2. You need to get a token from the [API explorer](https://auth0.com/docs/apiv2). The required scope is `read:connections`.

```js
function (user, context, callback) {
  request('https://login.auth0.com/api/v2/connections', {
    headers:
    {
      Authorization: 'Bearer ' + configuration.AUTH0_API_TOKEN  //TODO: replace with your own Auth0 APIv2 token
    }  
  },
  function(e,r,b){
    if(e) return callback(e);
    
    var connections = JSON.parse(b);
    var connection = connections[_.findIndex(connections,function(c){
      return (c.name === context.connection);
    })];

    //No domains -> access allowed
    if( !connection.options.tenant_domain ) return callback(null, user, context);

    //Access allowed if domains is found.
    if( _.findIndex(connection.options.domain_aliases,function(d){
     return user.email.indexOf(d) >= 0; 
    }) >= 0 ) return callback(null, user, context);

    return callback('Access denied');
  });
}
