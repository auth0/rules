/**
 * @overview Generate a Multipass URL that can be used for SSO with desk.com
 * @gallery true
 * @category webhook
 *
 * SSO with desk.com via Multipass
 *
 * This rule will generate a Multipass URL that can be used for SSO with <desk.com>. The details behind this are documented on [this article](http://dev.desk.com/guides/sso/#what).
 * https://puu.sh/7rstz
 * 
 * After successful login on your application, Auth0 will add the claim `https://example.com/desk_login_url` to the `id_token`. You can display this URL on your app. When a user follows the link, they will get access to desk.com automatically.
 * 
 * > Note: adjust the expiration of the Multipass so it is aligned with your app.
 */

function (user, context, callback) {
  const crypto = require('crypto');

  const deskSubDomain = 'YOUR DESK SUBDOMAIN'; //https://{subdomain}.desk.com
  const deskAPIKey = 'YOUR DESK MULTIPASS API KEY';

  //Mutipass with a 5 min expiration
  const deskToken = {
    uid: user.user_id,
    expires: (new Date(new Date().getTime() + (5 * 60 * 1000))).toISOString(),
    customer_email: user.email,
    customer_name: user.name
  };

  const mp = multipass(deskToken, deskAPIKey, deskSubDomain);
  const signature = sign(deskAPIKey, mp);

  context.idToken['https://example.com/desk_login_url'] = 'https://' + deskSubDomain + '.desk.com/customer/authentication/multipass/callback?multipass=' + encodeURIComponent(mp) + '&signature=' + encodeURIComponent(signature);

  function sign(key, multipass)
  {
    const sha1 = crypto.createHmac('sha1',key);
    return sha1.update(multipass).digest('base64');
  }

  function multipass(jsonData, apiKey, site) {
    const data = Buffer.from(JSON.stringify(jsonData), 'utf8');
    const key = crypto.createHash('sha1').update(apiKey + site).digest().slice(0, 16);
    const iv = Buffer.from('OpenSSL for Ruby', 'utf8');

    const pad = 16 - (data.length % 16);
    const paddedData = Buffer.from((data.length + pad).toString(), 'utf8');
    data.copy(paddedData);
    for (const i = data.length, len = paddedData.length; i < len; ++i) {
      paddedData[i] = pad;
    }
    // Encrypt with AES
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(false);
    const token = cipher.update(paddedData);

    const mp = Buffer.concat([iv, token]);

    return mp.toString('base64');
  }

  callback(null, user, context);
}
