/**
 * @overview Check if user email domain matches configured domain.
 * @gallery true
 * @category access control
 * 
 * Check user email domain matches domains configured in connection
 * 
 * This rule will check that the email the user has used to login matches any of the domains configured in a connection. If there are no domains configured, it will allow access.
 * 
 * Note: this rule uses the Auth0 Management API v2. You need to get a token from the [API explorer](https://auth0.com/docs/api/management/v2). The required scope is `read:connections`.
 * 
 */

function (user, context, callback) {
  request.get({
    url: 'https://login.auth0.com/api/v2/connections',
    headers: {
      Authorization: 'Bearer ' + configuration.AUTH0_API_TOKEN  //TODO: replace with your own Auth0 APIv2 token
    },
    json: true
  },
  (err, resp, body) => {
    if(err) return callback(err);
    
    const connection = _.find(body, (c) => c.name === context.connection);
    
    //No domains -> access allowed
    if (!connection.options.tenant_domain) {
      return callback(null, user, context);
    }
    
    //Access allowed if domains is found.
    if (_.findIndex(connection.options.domain_aliases, (d) => {
      return user.email.indexOf(d) >= 0; 
    }) >= 0 ) return callback(null, user, context);
    
    return callback('Access denied');
  });
}
