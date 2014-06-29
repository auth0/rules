---
gallery: true
categories:
- multifactor
---

## Multifactor with Duo Security

This rule is used to trigger multifactor authentication with [Duo Security](http://duosecurity.com) when a condition is met.

Upon first login, the user can enroll the device by scanning a QR code or an sms message. Subsequent logins will ask for the Google Authenticator code.

You need to create two __integrations__ in Duo Security one of type __WebSDK__ and the other __Admin SDK__.

```js
function (user, context, callback) {

  //if (condition == ..) { }
  context.multifactor = {
    provider: 'duo',
    skey: 'Your WebSDK Integration Key',
    ikey: '....',
    admin: {
      skey: 'Your AdminSDK Integration Key',
      ikey: 'YYY.....'
    }
  };

  callback(null, user, context);
}
```