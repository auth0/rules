## SSO with desk.com via Multipass

This rule will generate a Multipass URL that can be used for SSO with <desk.com>. The details behind this are documented on [this article](http://dev.desk.com/guides/sso/#what).

![](https://puu.sh/7rstz)

After successful login on your application, Auth0 will add the property `desk_login_url` to the __user profile__ object. You can display this URL on your app. When a user follows the link, they will get access to desk.com automatically.

> Note: adjust the expiration of the Multipass so it is aligned with your app.

```js
function (user, context, callback) {

  var deskSubDomain = 'YOUR DESK SUBDOMAIN'; //https://{subdomain}.desk.com
  var deskAPIKey = 'YOUR DESK MULTIPASS API KEY';

  //Mutipass with a 5 min expiration
  var deskToken = {
    "uid": user.user_id,
    "expires": (new Date(new Date().getTime() + (5 * 60 * 1000))).toISOString(),
    "customer_email": user.email,
    "customer_name": user.name
  };

  var mp = multipass(deskToken, deskAPIKey, deskSubDomain);
  var signature = sign(deskAPIKey, mp);

  user.desk_login_url = 'https://' + deskSubDomain + '.desk.com/customer/authentication/multipass/callback?multipass=' + encodeURIComponent(mp) + '&signature=' + encodeURIComponent(signature);

  function sign(key, multipass)
  {
    var sha1 = crypto.createHmac('sha1',key);
    return sha1.update(multipass).digest('base64');
  }

  function multipass(jsonData, apiKey, site) {
    var data = new Buffer(JSON.stringify(jsonData), 'utf8');
    var key = crypto.createHash('sha1').update(apiKey + site).digest('binary').substring(0, 16);
    var iv = new Buffer('OpenSSL for Ruby', 'utf8');

    var pad = 16 - (data.length % 16),
        paddedData = new Buffer(data.length + pad);
    data.copy(paddedData);
    for (var i = data.length, len = paddedData.length; i < len; ++i) {
      paddedData[i] = pad;
    }
    // Encrypt with AES
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(false);
    var token = cipher.update(paddedData);

    var mp = Buffer.concat([iv, token]);

    return mp.toString('base64');
  }

  callback(null, user, context);
}
```
