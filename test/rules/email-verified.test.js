'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'email-verified';

describe(ruleName, () => {
  let user;
  let context;
  let rule;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };
    
    rule = loadRule(ruleName, globals);

    context = new ContextBuilder().build();
  });

  describe('when email is verified', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withEmailVerified(true)
        .build();
    })
    it('should allow access', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeNull();

        done();
      });
    });
  });
  describe('when email is not verified', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withEmailVerified(false)
        .build();
    })
    it('should not allow access', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);

        done();
      });
    });
  });
});
