'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder')

const ruleName = 'disable-resource-owner';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };

    user = new UserBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  describe('when context protocol matches specified', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withProtocol('oauth2-resource-owner')
        .build();
    });

    it('should return an unauthorized error', (done) => {    
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);
        done();
      });
    });
  })
});
