---
gallery: true
short_description: Set a sensitive value in the app_metadata and encrypt it
categories:
- enrich profile
---
## Encrypt sensitive data in the user profile

This rule will set a sensitive value in the app_metadata and encrypt it (see the [Decrypt sensitive data from the user profile](https://auth0.com/rules/decrypt-sensitive-data) rule for information on how to decrypt the data).

```js
function (user, context, callback) {
  user.app_metadata = user.app_metadata || { };
  user.app_metadata.private_data = encrypt({
    license_key: '1234567',
    social_security_number: '56789'
  });
  user.idToken['https://example.com/private_data'] = user.app_metadata.private_data;

  callback(null, user, context);

  function encrypt(data) {
    var iv = new Buffer(configuration.ENCRYPT_IV);
    var decodeKey = crypto.createHash('sha256')
      .update(configuration.ENCRYPT_PASSWORD, 'utf-8').digest();
    var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    return cipher.update(JSON.stringify(data || {}), 'utf8', 'base64') + cipher.final('base64');
  }
}
```

The `user` will look like this after the encryption:

```json
{
  "name": "jdoe",
  "email": "jdoe@foobar.com",
  "nickname": "jdoe",
  "picture": "http://foobar.com/pictures/jdoe.png",
  "app_metadata": {
    "private_data": "46d2581f53ad45a9423182de2de1ca306659dd94101808cb20338b6a6a2f6e32899747197cfe8ade5a1d8b1ed5b9552357a4264b2cc766ea784e1ca688ce84ed"
  },
  "user_id": "foobar.com|0123456789"
}
```

Note, for this to work you'll need to set two configuration settings. Both should be random strings:

- `ENCRYPT_PASSWORD`
- `ENCRYPT_IV`
