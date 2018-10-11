/**
 * @title Change SAML configuration
 * @overview Change your SAML configuration.
 * @gallery true
 * @category saml
 *
 * At some point you may want to add fields to your SAML Configuration. The way to do this is to add specific fields as done in the example code snippet below.
 * `samlConfiguration` is an object that controls the behavior of the SAML and WS-Fed endpoints. Useful for advanced claims mapping and token enrichment (only available for SAMLP and WS-Fed protocol).
 *
 * To know more about SAML configuration options check [this documentation page](https://auth0.com/docs/saml-configuration#configuration-options).
 *
 */

function (user, context, callback) {
  if (context.clientID !== '{YOUR_SAMLP_OR_WSFED_CLIENT_ID}') return callback(null, user, context);

  context.samlConfiguration = context.samlConfiguration || {};
  context.samlConfiguration.audience = "urn:foo";
  context.samlConfiguration.recipient = "http://foo";
  context.samlConfiguration.destination = "http://foo";
  context.samlConfiguration.lifetimeInSeconds = 3600;
  //context.samlConfiguration.mappings = {
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":     "user_id",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":       "email",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":        "name",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname":  "given_name",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname": "family_name",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn":         "upn",
  //   "http://schemas.xmlsoap.org/claims/Group":      "groups"
  // };
  //context.samlConfiguration.nameIdentifierFormat = "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified";
  //context.samlConfiguration.nameIdentifierProbes = [
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  // ];
  //context.samlConfiguration.signatureAlgorithm = "rsa-sha1";
  //context.samlConfiguration.digestAlgorithm = "sha1";
  //context.samlConfiguration.signResponse = false;
  //context.samlConfiguration.authnContextClassRef = "urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified";
  //context.samlConfiguration.mapIdentities = false;
  //context.samlConfiguration.mapUnknownClaimsAsIs = false;
  //context.samlConfiguration.passthroughClaimsWithNoMapping = true;
  //context.samlConfiguration.createUpnClaim = true;
  //context.samlConfiguration.logout = {
  //   "callback": "http://foo/logout"
  // }

  //context.samlConfiguration.RelayState = "foo=bar"; // SAMLP protocol only
  //context.samlConfiguration.wctx = "foo=bar"; // WS-Fed protocol only

  callback(null, user, context);
}
