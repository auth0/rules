/**
 * @overview Check if user email domain matches configured domain.
 * @gallery true
 * @category access control
 * 
 * Check user email domain matches domains configured in connection
 * 
 * This rule will check that the email the user has used to login matches any of the domains configured in a connection. If there are no domains configured, it will allow access.
 * 
 * For example, to setup SAML login, a Fabrikam customer must have a managed domain (claimed and verified by the customer). Fabrikam can then enforce a policy where only users belonging to managed email domains should be able to login via SAML. For example, if the customer Contoso has setup contoso.com as a managed domain, only users with email ending @contoso.com (not @contosocorp.com) should be able to login via SAML.
 * Because Auth0 doesn't enforce this validation OOB - we have to store the valid email domain in connection object (lock already uses this) and then use a rule to validate incoming user's email domain with the one configured on the connection. If email domains doesn't match, the login is denied.
 */

function (user, context, callback) {
  const connectionOptions = context.connectionOptions;
    
  // No domains -> access allowed
  if (!connectionOptions.tenant_domain) {
    return callback(null, user, context);
  }
  
  // Access allowed if domain is found
  const userEmailDomain = user.email.split('@')[1].toLowerCase();
  const domainFound = user.email_verified && connectionOptions.domain_aliases.some(function (domain) {
    return userEmailDomain === domain;
  });

  if (domainFound) return callback(null, user, context);
  
  return callback('Access denied');
}
