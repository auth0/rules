---
gallery: true
short_description: Add attributes to a user for specific connection
categories:
- enrich profile
---
## Add attributes to a user for specific connection

This rule will add an attribute to the user only for the login transaction (i.e. they won't be persisted to the user). This is useful for cases where you want to enrich the user information for a specific application.

```js
function (user, context, callback) {
  if (context.connection === 'company.com') {
    context.idToken['https://example.com/vip'] = true;
  }

  callback(null, user, context);
}
```
