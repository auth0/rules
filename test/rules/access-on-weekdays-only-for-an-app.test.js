'use strict';

const loadRule = require('../utils/load-rule');

const ruleName = 'access-on-weekdays-only-for-an-app';

describe(ruleName, () => {
  let globals;
  let user;
  let context;
  let rule;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };
    context = {
      clientName: 'TheAppToCheckAccessTo'
    };

    rule = loadRule(ruleName, globals);
  });

  describe('when day is weekend', () => {
    beforeEach(() => {
      global.Date.getDay = jest.genMockFunction().mockReturnValue(6);
    })
    it('should return UnauthorizedError', (done) => {
      rule(user, context, (err, user, context) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);
        done();
      });
    });
  })
  describe('when day is week day', () => {
    beforeEach(() => {
      global.Date.getDay = jest.genMockFunction().mockReturnValue(3);
    })
    it('should return no error', (done) => {
      rule(user, context, (err, cbUser, cbContext) => {
        expect(err).toBeNull();
        expect(user).toBe(user);
        expect(context).toBe(context);
        done();
      });
    });
  })
});
