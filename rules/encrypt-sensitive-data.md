---
gallery: true
categories:
- enrich profile
---
## Encrypt sensitive data in the user profile

This rule will set a sensitive value in the app_metadata and encrypt it.

```js
function (user, context, callback) {
  user.app_metadata = user.app_metadata || { };
  user.app_metdata.private_data = encrypt({
    license_key: '1234567',
    social_security_number: '56789'
  });

  callback(null, user, context);
  
  function encrypt = function(data) {
    var iv = new Buffer(configuration.ENCRYPT_IV);
    var decodeKey = crypto.createHash('sha256')
      .update(configuration.ENCRYPT_PASSWORD, 'utf-8').digest();
    var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    return cipher.update(JSON.stringify(data || {}), 'utf8', 'hex') + cipher.final('hex');
  }
}
```

The `user` will look like this after the encryption:

```
{
  "name": "jdoe",
  "email": "jdoe@foobar.com",
  "nickname": "jdoe",
  "picture": "http://foobar.com/pictures/jdoe.png",
  "app_metadata": {
    "private_data": "5579405b71bbf8390b7ce560522fe9cb20a129ac9fb3b3340d3910daab7dc372643e3c61ac02296f2d476b704cec7ceffc3371724f9ed27e2942c80926c69878"
  },
  "user_id": "foobar.com|0123456789"
}
```

Note, for this to work you'll need to set 2 configuration settings:

- `ENCRYPT_PASSWORD`, eg: S0me,Password!è§
- `ENCRYPT_IV`, eg: 0110011001100110
