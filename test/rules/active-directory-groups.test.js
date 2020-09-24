'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'active-directory-groups';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };

    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  describe('when user is not in allowed group', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withGroups(['group'])
        .build();
    })
    it('should return an UnauthorizedError', (done) => {
      rule(user, context, (err, u, c) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);
  
        done();
      });
    });
  });

  describe('when user is in allowed group', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withGroups(['group1'])
        .build();
    })
    it('should not return an error', (done) => {
      rule(user, context, (err, u, c) => {
        expect(err).toBeNull();
  
        done();
      });
    });
  });
});
