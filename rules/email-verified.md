---
gallery: true
categories:
- access control
---
# Force email verification

This rule will only allow access users that have verified their emails.
Note that it might be a better UX to make this verification from your application.

```js
function (user, context, callback) {
  if (!user.email_verified) {
    return callback(new UnauthorizedError('Please verify your email before logging in.'));
  } else {
    return callback(null, user, context);
  }
}
```
