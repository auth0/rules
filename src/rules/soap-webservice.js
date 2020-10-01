/**
 * @title Roles from a SOAP Service
 * @overview Show how to query a basic profile http binding SOAP web service for roles.
 * @gallery true
 * @category enrich profile
 *
 * This rule shows how to query a basic profile http binding SOAP web service for roles and add those to the user.
 *
 */

function getRolesFromSoapService(user, context, callback) {
  const request = require('request');
  const xmldom = require('xmldom');
  const xpath = require('xpath');

  function getRoles(cb) {
    request.post(
      {
        url: 'https://somedomain.com/RoleService.svc',
        body:
          '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRolesForCurrentUser xmlns="http://tempuri.org"/></s:Body></s:Envelope>',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'http://tempuri.org/RoleService/GetRolesForCurrentUser'
        }
      },
      function (err, response, body) {
        if (err) return cb(err);

        const parser = new xmldom.DOMParser();
        const doc = parser.parseFromString(body);
        const roles = xpath
          .select("//*[local-name(.)='string']", doc)
          .map(function (node) {
            return node.textContent;
          });
        return cb(null, roles);
      }
    );
  }

  getRoles(function (err, roles) {
    if (err) return callback(err);

    context.idToken['https://example.com/roles'] = roles;

    callback(null, user, context);
  });
}
