'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'google-multifactor';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {};

    user = new UserBuilder().build();

    context = new ContextBuilder()
      .withClientId('REPLACE_WITH_YOUR_CLIENT_ID')
      .build();    

    rule = loadRule(ruleName, globals);
  });

  it('should set multifactor on the context to google authenticator', (done) => {
    rule(user, context, (e, u, c) => {

      expect(c.multifactor.provider).toBe('google-authenticator');

      done();
    });
  });
});
