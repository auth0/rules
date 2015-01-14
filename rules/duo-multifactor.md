---
gallery: true
categories:
- multifactor
---

## Multifactor with Duo Security

This rule is used to trigger multifactor authentication with [Duo Security](http://duosecurity.com) when a condition is met.

Upon first login, the user can enroll the device.

You need to create two __integrations__ in __Duo Security__: one of type __WebSDK__ and the other __Admin SDK__.

```js
function (user, context, callback) {

  //if (condition == ..) { }
  context.multifactor = {

    //required
    provider: 'duo',
    ikey: 'DIXBMN...LZO8IOS8',
    skey: 'nZLxq8GK7....saKCOLPnh',
    host: 'api-3....049.duosecurity.com',

    //optional, force DuoSecurity everytime this rule runs. Defaults false.
    ignoreCookie: true,

    //optional
    //Use some attribute of the profile as the username in DuoSecurity.
    //This is also useful if you already have your users enrolled in Duo.
    username: user.nickname,

    //optional
    //Admin credentials. If you provide an Admin SDK type of credentials
    //auth0 will update the realname and email in DuoSecurity.
    admin: {
      ikey: 'DIAN...NV6UM',
      skey: 'YL8OVzvoeeh...I1uiYrKoHvuzHnSRj'
    },
  };

  callback(null, user, context);
}
```
