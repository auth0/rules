'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'google-service-account-token';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  const expectedAccessToken = 'this is not the access token you are looking for';

  beforeEach(() => {
    globals = {
      request: {
        post: jest
          .fn()
          .mockImplementation((url, cb) => {
            cb(null, null, JSON.stringify({ access_token: expectedAccessToken }))
          })
      },
      jwt: {
        sign: jest
          .fn()
          .mockReturnValue('token')
      }
    };

    user = new UserBuilder().build();

    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  it('should set the access_token on the idToken', (done) => {    
    rule(user, context, (e, u, c) => {
      expect(context.idToken['https://example.com/admin_access_token']).toBe(expectedAccessToken);

      done();
    });
  });
});
