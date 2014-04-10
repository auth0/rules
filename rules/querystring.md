---
categories:
- enrich profile
---
## Querystring

This rule shows how to check for variables in the `querystring`. As an example, the snippet below checks if the login transaction includes a query variable called `some_querystring` with a value `whatever` and if it does, it will add an attribute to the user profile.

An example of typicall authorization URL:
```
https://YOURS.auth0.com/authorize?response_type=code
                  &redirect_uri=CALLBACK
                  &connection=google-oauth2
                  &client_id=YOUR_CLIENTID
                  &some_querystring=whatever
```

The `context.request.query` object is parsed using the `querystring` module <http://nodejs.org/api/querystring.html>

> Note: this rule works with any protocols supported by Auth0. For example, WS-Fed would be something like: `https://YOURS.auth0.com/wsfed?wtrealm=YOUR_APP_REALM&whr=urn:google-oauth2&some_querystring=whatever`

```js
function (user, context, callback) {
  if (context.request.query.some_querystring === 'whatever') {
     user.new_attribute = 'foo';
  }

  callback(null, user, context);
}
```
