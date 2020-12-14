'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'mfa-require-enrollment';

describe(ruleName, () => {
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  const givenEnrolledUser = () => {
    return new UserBuilder().withMultifactor(['guardian']).build();
  };

  const givenNotEnrolledUser = () => {
    return new UserBuilder().withMultifactor([]).build();
  };

  describe('for enrolled user', () => {
    it('should not set multifactor', (done) => {
      const user = givenEnrolledUser();
      const context = new ContextBuilder()
        .build();

      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeUndefined();

        done();
      });
    });
  });

  describe('for not enrolled user', () => {
    it("should set multifactor provider to 'any'", (done) => {
      const user = givenNotEnrolledUser();
      const context = new ContextBuilder()
        .build();

      rule(user, context, (err, u, c) => {
        expect(c.multifactor.provider).toBe('any');

        done();
      });
    });
  });
});
