/**
 * @overview .NET example of decrypting sensitive data from the user profile
 * @gallery true
 * @category enrich profile
 * @description Decrypt a sensitive value from the app_metadata
 * 
 * This rule will get a sensitive value in the app_metadata and decrypt it (see the https://auth0.com/rules/encrypt-sensitive-data rule for information on how to encrypt the data).
 * 
 */

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