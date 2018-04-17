---
gallery: true
short_description: Decrypt a sensitive value from the app_metadata
categories:
- enrich profile
---
## Decrypt sensitive data from the user profile

This rule will get a sensitive value in the app_metadata and decrypt it (see the [Encrypt sensitive data in the user profile](https://auth0.com/rules/encrypt-sensitive-data) rule for information on how to encrypt the data).

```js
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
```

Note, for this to work you'll need to set 2 configuration settings:

- `ENCRYPT_PASSWORD`, eg: **S0me,Password!è§**
- `ENCRYPT_IV`, eg: **abcjfiekdpaifjfd**

And here's an example of how you would decrypt this in .NET:

```cs
public static string Decrypt(string encryptedText, string keyString, string ivString)
{
	using (var crypt = new SHA256Managed())
	{
		var key = crypt.ComputeHash(Encoding.UTF8.GetBytes(keyString));
		var iv  = Encoding.UTF8.GetBytes(ivString);

		using (var rijndaelManaged = new RijndaelManaged {Key = key, IV = iv, Mode = CipherMode.CBC}){

			rijndaelManaged.Padding = PaddingMode.Zeros;

			using (var memoryStream = new MemoryStream(Convert.FromBase64String(encryptedText)))
				using (var cryptoStream = new CryptoStream(memoryStream,
					rijndaelManaged.CreateDecryptor(key, iv), CryptoStreamMode.Read))
			{
				return new StreamReader(cryptoStream).ReadToEnd();
			}
		}
	}
}
```
