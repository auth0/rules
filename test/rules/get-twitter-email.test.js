'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'get-twitter-email';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let stubs = {};

  beforeEach(() => {
    globals = {
      request: {
        get: jest
          .fn()
          .mockImplementationOnce((url, obj, cb) => {
            cb(null, { statusCode: 200 }, twitterDataSample)
          })   
      },
      _: require('lodash')
    };

    user = new UserBuilder()
      .withIdentities([
        {
          connection: 'twitter',
          access_token: 'token',
          access_token_secret: 'secret'
        }
      ])
      .build();

    context = new ContextBuilder()
      .withConnectionStrategy('twitter')
      .build();

    stubs['oauth-sign'] = {
      hmacsign: jest.fn(() => 'oauth sig'),
      rfc3986: jest.fn(() => 'rfc val')
    };
    stubs['uuid'] = {
      v4: jest.fn(() => 'cfef96ed-3198-44ee-b7fd-64caeaca7b76')
    };

    rule = loadRule(ruleName, globals, stubs);
  });

  it('should assign email from twitter to user', (done) => {
    rule(user, context, (e, u, c) => {
      expect(u.email).toBe(twitterDataSample.email);

      done();
    });
  });
});

const twitterDataSample = {
  email: 'some@email.test'
}
