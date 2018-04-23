/**
 * @overview Decrypt sensitive data from the user profile
 * @gallery true
 * @category enrich profile
 * @description Decrypt a sensitive value from the app_metadata
 * 
 * <p>This rule will get a sensitive value in the app_metadata and decrypt it 
 * (see the <a href="https://auth0.com/rules/src/rules/encrypt-sensitive-data.js">Encrypt sensitive data in the user profile</a> rule for information on how to encrypt the data).</p>
 * 
 * <p>Note, for this to work you'll need to set 2 configuration settings:</p>
 * ENCRYPT_PASSWORD, eg: **S0me,Password!è§**
 * ENCRYPT_IV, eg: **abcjfiekdpaifjfd**
 * 
 */

function (user, context, callback) {
  user.app_metadata = user.app_metadata || { };

  const private_data = decrypt(user.app_metadata.private_data);
  if (private_data.license_key === '1234567') {
    user.role = 'admin';
  }

  return callback(null, user, context);

  function decrypt(data) {
    if (!data) {
      return {};
    }
    const iv = Buffer.from(configuration.ENCRYPT_IV, 'utf8');
    const encodeKey = crypto.createHash('sha256')
    .update(configuration.ENCRYPT_PASSWORD, 'utf8').digest();
    const cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
    const decrypted = cipher.update(data, 'base64', 'utf8') + cipher.final('utf8');
    return JSON.parse(decrypted);
  }
}