'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder')

const ruleName = 'add-email-to-access-token';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);

    user = new UserBuilder().build();
    context = new ContextBuilder().build();
  });

  it('should add email to outgoing accessToken', (done) => {
    const namespace = 'https://example.com/';
    rule(user, context, (err, u, c) => {
      expect(c.accessToken[namespace + 'email']).toBe(user.email);

      done();
    });
  });
});
