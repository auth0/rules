/**
 * @title shopify-leads-from-login
 * @overview Add lead to Shopify at login
 * @gallery true
 * @category webhook
 *
 * This rule is used to add user accounts to Shopify as user logs in
 *
 */

async function addShopifyUser(user, context, callback) {
  const fetch = require('node-fetch@2.6.0');
  const { URL } = require('url');
  const CONFIG = {
    API_KEY: 'YOUR_API_KEY',
    API_PWD: 'YOUR_API_PASSWORD',
    API_URL: 'YOUR_STORE.myshopify.com'
  };
  try {
    const url = new URL(
      `https://${CONFIG.API_KEY}:${CONFIG.API_PWD}@${CONFIG.API_URL}/admin/api/2020-04/customers.json`
    );
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: {
          first_name: 'Steve',
          last_name: 'Lastnameson',
          email: 'steve.lastnameson@example.com',
          phone: '+15142546011',
          verified_email: true,
          addresses: [
            {
              address1: '123 Oak St',
              city: 'Ottawa',
              province: 'ON',
              phone: '555-1212',
              zip: '123 ABC',
              last_name: 'Lastnameson',
              first_name: 'Mother',
              country: 'CA'
            }
          ]
        }
      })
    });
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
