/**
 * @overview Encrypt sensitive data in the user profile
 * @gallery true
 * @category enrich profile
 * @description Set a sensitive value in the app_metadata and encrypt it
 * 
 * <p>This rule will set a sensitive value in the app_metadata and encrypt it
 * (see the <a href="https://auth0.com/rules/src/rules/decrypt-sensitive-data.js">Decrypt sensitive data from the user profile</a> rule for information on how to decrypt the data).</p>
 * 
 * <p>Note, for this to work you'll need to set 2 configuration settings:</p>
 * ENCRYPT_PASSWORD, eg: **S0me,Password!è§**
 * ENCRYPT_IV, eg: **abcjfiekdpaifjfd**
 * 
 */

function (user, context, callback) {
  context.idToken['https://example.com/private_data'] = encrypt({
    license_key: '1234567',
    social_security_number: '56789'
  });

  callback(null, user, context);

  function encrypt(data) {
    const iv = Buffer.from(configuration.ENCRYPT_IV, 'utf8');
    const decodeKey = crypto.createHash('sha256')
      .update(configuration.ENCRYPT_PASSWORD, 'utf8').digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    return cipher.update(JSON.stringify(data || {}), 'utf8', 'base64') + cipher.final('base64');
  }
}