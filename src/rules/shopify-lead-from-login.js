/**
 *
 * This rule is used to add user accounts to Shopify as user logs in
 *
 * @title shopify-leads-from-login
 * @overview Add lead to Shopify at login
 * @gallery true
 * @category webhook
 */

async function addShopifyUser(user, context, callback) {
  const fetch = require('node-fetch@2.6.0');

  try {
    const res = await fetch(
      `https://${configuration.SHOPIFY_API_KEY}:${configuration.SHOPIFY_API_PWD}@${configuration.SHOPIFY_API_URL}/admin/api/2020-04/customers.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            first_name: user.given_name,
            last_name: user.family_name,
            email: user.email,
            verified_email: user.email_verified
          }
        })
      }
    );

    const body = await res.text();
    if (!res.ok) {
      callback(new Error(body));
      return;
    }
    callback(null, user, context);
  } catch (err) {
    callback(err);
  }
}
