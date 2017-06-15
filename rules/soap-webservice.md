---
gallery: true
short_description: Show how to query a basic profile http binding SOAP web service for roles
categories:
- enrich profile
---
## Roles from a SOAP Service

This rule shows how to query a basic profile http binding SOAP web service for roles and add those to the user.

```js
function (user, context, callback) {
  function getRoles(callback) {
    request.post({
      url:  'https://somedomain.com/RoleService.svc',
      body: '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRolesForCurrentUser xmlns="http://tempuri.org"/></s:Body></s:Envelope>',
      headers: { 'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': 'http://tempuri.org/RoleService/GetRolesForCurrentUser' }
    }, function (err, response, body) {
      if (err) return callback(err);

      var parser = new xmldom.DOMParser();
      var doc = parser.parseFromString(body);
      var roles = xpath.select("//*[local-name(.)='string']", doc).map(function(node) { return node.textContent; });
      return callback(null, roles);
    });
  }

  getRoles(user.email, function(err, roles) {
    if (err) return callback(err);

    context.idToken['https://example.com/roles'] = roles;

    callback(null, user, context);
  });
}
```
