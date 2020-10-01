'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'test-require';
describe.only(ruleName, () => {
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

  describe('when executing', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withGroups(['group'])
        .build();
    })
    it('requires should not error', (done) => {
      rule(user, context, (err, u, c) => {
        expect(err).toBeNull();
        done();
      });
    });
  });
});
