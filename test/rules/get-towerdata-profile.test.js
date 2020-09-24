'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'get-towerdata-profile';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let request;

  beforeEach(() => {
    globals = {
      global: {},
      configuration: {
        TOWERDATA_API_KEY: 'YOUR towerdata API KEY'
      }
    };

    request = {
      get: jest
        .fn()
        .mockImplementationOnce((url, obj, cb) => {
          cb(null, { statusCode: 200 }, towerdataBody);
        })
    };

    user = new UserBuilder().build();
    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals, { request });
  });

  describe('when the rule is executed', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .build();

      context = new ContextBuilder()
        .build();
    });

    it('should do nothing if the user has no email', (done) => {
      user.email = '';
      rule(user, context, (e) => {
        expect(e).toBeFalsy();
        done();
      });
    });

    it('should do nothing if user`s email isn`t verified', (done) => {
      user.email_verified = false;
      rule(user, context, (e) => {
        expect(e).toBeFalsy();
        done();
      });
    });
  });

  it('should set the tower data body on the context idToken', (done) => {
    rule(user, context, (e, u, c) => {
      expect(c.idToken['https://example.com/towerdata']).toBe(towerdataBody);

      done();
    });
  });
});

const towerdataBody = {
  test: 'test'
};
