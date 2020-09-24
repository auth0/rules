'use strict';

const loadRule = require('../utils/load-rule');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'shopify-lead-from-login';

describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let stubs = {};

  beforeEach(() => {
    globals = {
      configuration: {
        SHOPIFY_API_KEY: 'Some-API-key',
        SHOPIFY_API_PWD: 'Some-API-password',
        SHOPIFY_API_URL: 'your-store-name.myshopify.com'
      }
    };

    user = new UserBuilder().build();
    user.given_name = 'Super';
    user.family_name = 'User';
  });

  it('handles a non-successful response from Shopify API', (done) => {
    stubs['node-fetch@2.6.0'] = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        text: () => Promise.resolve('There be dragons')
      }));
    rule = loadRule(ruleName, globals, stubs);

    rule(user, context, (err) => { 

      expect(err.message).toBe('There be dragons');

      done();
    });
  });

  it('handles a fetch error when calling the Shopify API', (done) => {
    const someError = new Error('System failure');

    stubs['node-fetch@2.6.0'] = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject(someError));
    rule = loadRule(ruleName, globals, stubs);

    rule(user, context, (err) => { 
      expect(err).toBe(someError);

      done();
    });
  });
 
  it('calls the Shopfy API with expected configuration and customer data sourced from the Auth0 user object', (done) => {
    stubs['node-fetch@2.6.0'] = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('Happy trees')
      }));
    rule = loadRule(ruleName, globals, stubs);

    rule(user, context, () => { });

    const fetchCallUrl = stubs['node-fetch@2.6.0'].mock.calls[0][0];
    expect(fetchCallUrl).toBe('https://Some-API-key:Some-API-password@your-store-name.myshopify.com/admin/api/2020-04/customers.json')

    const fetchCallOptions = stubs['node-fetch@2.6.0'].mock.calls[0][1];
    expect(fetchCallOptions.method).toBe('POST');
    expect(fetchCallOptions.headers['Content-Type']).toBe('application/json')
    const bodyJson = JSON.parse(fetchCallOptions.body);
    expect(bodyJson.customer.first_name).toBe('Super');
    expect(bodyJson.customer.last_name).toBe('User');
    expect(bodyJson.customer.email).toBe('superuser@users.com');
    expect(bodyJson.customer.verified_email).toBe(true);

    done();
  });
});
