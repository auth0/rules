'use strict';

const loadRule = require('../utils/load-rule');

const ruleName = 'add-attributes';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('when connection is from a specified company', () => {
    beforeEach(() => {
      context = {
        connection: 'company.com',
        idToken: {}
      };
    })
    it('should set the idToken', (done) => {
      rule(user, context, (err, user, context) => {
        expect(context.idToken['https://example.com/vip']).toBe(true);
        done();
      });
    });
  })
});
