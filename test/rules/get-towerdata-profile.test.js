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

  beforeEach(() => {
    globals = {
      global: {},
      request: {
        get: jest
          .fn()
          .mockImplementationOnce((url, obj, cb) => {
            cb(null, { statusCode: 200 }, towerdataBody)
          })
      },
      configuration: {
        TOWERDATA_API_KEY: 'YOUR towerdata API KEY'
      }
    };

    user = new UserBuilder().build();
    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
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
