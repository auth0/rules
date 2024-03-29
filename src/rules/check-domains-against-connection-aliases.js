/**
 *
 * This rule checks if the user's login email matches any domains configured in an enterprise connection. If there are no matches, the login is denied. But, if there are no domains configured it will allow access.
 *
 * Use this rule to only allow users from specific email domains to login.
 *
 * For example, ExampleCo has setup exampleco.com as a managed domain. They add exampleco.com to the email domains list in their SAML connection. Now, only users with an email ending with @exampleco.com (and not @examplecocorp.com) can login via SAML.
 *
 * @title Check if user email domain matches configured domain
 * @overview Check user email domain matches domains configured in connection.
 * @gallery true
 * @category access control
 */

function checkDomainsAgainstConnectionAliases(user, context, callback) {
  const connectionOptions = context.connectionOptions;
  const domainAliases = connectionOptions.domain_aliases || [];
  const tenantDomain = connectionOptions.tenant_domain;

  // No domains -> access allowed
  if (!tenantDomain && !domainAliases.length) {
    return callback(null, user, context);
  }

  // Domain aliases exist but no tenant domain exists
  if (domainAliases.length && !tenantDomain) return callback('Access denied');

  const allowedDomains = new Set([tenantDomain]);
  domainAliases.forEach(function (alias) {
    if (alias) allowedDomains.add(alias.toLowerCase());
  });

  // Access allowed if domain is found
  const emailSplit = user.email.split('@');
  const userEmailDomain = emailSplit[emailSplit.length - 1].toLowerCase();
  if (allowedDomains.has(userEmailDomain)) return callback(null, user, context);

  return callback('Access denied');
}
