/**
 *
 * This rule shows how to check for variables in the `querystring`. As an example, the snippet below checks if the login transaction includes a query variable called `some_querystring` with a value `whatever` and if it does, it will add an attribute to the user profile.
 * An example of typical authorization URL:
 * `https://YOURS.auth0.com/authorize?some_querystring=whatever&client_id=YOUR_CLIENTID&...`
 *
 * The `context.request.query` object is parsed using the `querystring` module <http://nodejs.org/api/querystring.html>
 *
 * > Note: this rule works with any protocols supported by Auth0. For example, WS-Fed would be something like: `https://YOURS.auth0.com/wsfed?wtrealm=YOUR_APP_REALM&whr=urn:google-oauth2&some_querystring=whatever`
 *
 * @title Querystring
 * @overview Show how to check for variables in the querystring
 * @gallery false
 * @category enrich profile
 */

function useQuerystring(user, context, callback) {
  if (context.request.query.some_querystring === 'whatever') {
    context.idToken['https://example.com/new_attribute'] = 'foo';
  }

  callback(null, user, context);
}
