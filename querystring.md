## Querystring

This rule checks if the login transaction includes a query variable called `some_querystring` with a value `whatever` and if it does, it will add an attribute.

For instance, this login request will match the if `https://YOURS.auth0.com/authorize?response_type=code&redirect_uri=CALLBACK&connection=google-oauth2&client_id=YOUR_CLIENTID&some_querystring=whatever`.
The `context.request.query` object is parsed using the `querystring` module <http://nodejs.org/api/querystring.html>

> Note: it works for other protocols as well. E.g. WS-Fed would be `https://YOURS.auth0.com/wsfed?wtrealm=YOUR_APP_REALM&whr=urn:google-oauth2&some_querystring=whatever`

```js
function (user, context, callback) {
  if (context.request.query.some_querystring === 'whatever') {
     user.new_attribute = 'foo';
  }
  
  callback(null, user, context);
}
```
