---
gallery: true
short_description:  Check if user email domain matches configured domain
categories:
- access control
---
## Check user email domain matches domains configured in connection

This rule checks if the user's login email matches any domains configured in an enterprise connection. If there are no matches, the login is denied. But, if there are no domains configured it will allow access.

Use this rule to only allow users from specific email domains to login.
 
For example, ExampleCo has setup exampleco.com as a managed domain. They add exampleco.com to the email domains list in their SAML connection. Now, only users with an email ending with @exampleco.com (and not @examplecocorp.com) can login via SAML.

```js
function (user, context, callback) {
  const connectionOptions = context.connectionOptions;
    
  // No domains -> access allowed
  if (!connectionOptions.tenant_domain) {
    return callback(null, user, context);
  }
  
  // Access allowed if domain is found
  const userEmailDomain = user.email.split('@')[1].toLowerCase();
  const domainFound = connectionOptions.domain_aliases.some(function (domain) {
    return userEmailDomain === domain;
  });

  if (domainFound) return callback(null, user, context);
  
  return callback('Access denied');
}
```
